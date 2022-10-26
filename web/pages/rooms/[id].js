import {
  createRef,
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import Navbar from '@/components/Navbar';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Dropdown from '@/components/Dropdown';
import Title from '@/components/Title';
import Chat from '@/components/ChatButton';
import Modal, { useModal } from '@/components/Modal';
import { useToast } from '@/providers/ToastProvider';
import Switch from '@/components/Switch';
import Kbd from '@/components/Kbd';
import useForm from '@/hooks/useForm';
import RoomPlayer from '@/components/RoomPlayer';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/router';
import axios from 'axios';
import cuid from 'cuid';
import Cookies from 'js-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShareFromSquare } from '@fortawesome/free-solid-svg-icons';

const OneRoomPage = () => {
  // Auth
  const auth = useAuth();

  // Toast!
  const toast = useToast();

  // Router
  const router = useRouter();

  // Modals
  const passModal = useModal();
  const shareModal = useModal();

  // State
  const [initLoading, setInitLoading] = useState(true);
  const [passForm, handlePassForm] = useForm({ room_pass: '' });
  const [scramble, setScramble] = useState('Loading...');
  const [values, handleChange] = useForm({ sitOut: false });
  const [title, setTitle] = useState('');
  const [playing, setPlaying] = useState(false);
  const [spectate, setSpectate] = useState(null);
  const [usingTimer, setUsingTimer] = useState(false);
  const [players, setPlayers] = useState([]);
  const [runningTime, setRunningTime] = useState(0);
  const [gameState, setGameState] = useState({
    time: 0,

    editTime: false,

    timerIsPrimed: false,
    timerIsRunning: false,
    runningCallback: null,
    startTime: 0
  });
  const [roomPassword, setRoomPassword] = useState('');
  const [event, setEvent] = useState('333');

  // Chat
  const [chatMessages, setChatMessages] = useState('');

  // WebSocket ref
  const ws = useRef();
  const [websocketOpts, setWebsocketOpts] = useState({
    id: null,
    url: null
  });

  // Edit time
  const editTimeInput = createRef();
  const [editTimeValue, setEditTimeValue] = useState('');

  // Timer event listeners
  const timerEvents = useRef([]);

  // Timer modal ref for mobile
  const timerModal = createRef();

  // Room fetch flow
  const fetchFlow = useCallback(
    async (room_id, pass, spectate) => {
      auth.preFetch().then(() => {
        axios
          .post(
            `/api/rooms/${room_id}/join`,
            {
              pass,
              spectate
            },
            auth.withCreds({})
          )
          .then(res => {
            // 4a. Open modal for password
            if (res.data.needs_pass) {
              passModal.open();
              return;
            }

            if (spectate) {
              setSpectate(true);
            } else {
              Cookies.set('_ws_id', res.data.ws_id, {
                expires: 1,
                sameSite: 'Strict'
              });
              setSpectate(false);
            }

            // 8. Set up websocket
            setInitLoading(false);
            setWebsocketOpts({
              id: res.data.ws_id || '',
              url: res.data.ws_url
            });
          });
      });
    },
    [auth, passModal]
  );

  // Page mount; Run the authentication flow for current room
  useEffect(() => {
    // 1. Arrive at page
    if (!router.query || !router.query.id) {
      return;
    }

    const room_id = router.query.id;
    const spectate = router.query.spectate;

    // 2. Request access
    fetchFlow(room_id, roomPassword, spectate).catch(err =>
      toast.addToast({
        title: 'Error',
        text: err.response.data.reason,
        delay: 5000,
        variant: 'error'
      })
    );

    return () => {
      ws.current?.close(1000);
    };
  }, [router.query, roomPassword]);

  // Send WebSocket handshake
  useEffect(() => {
    if (websocketOpts.id === null || spectate === null) {
      return;
    }

    ws.current = new WebSocket(websocketOpts.url);

    ws.current.onopen = () => {
      ws.current.send(
        JSON.stringify({
          type: 'handshake',
          id: websocketOpts.id,
          spectate
        })
      );
    };

    ws.current.onmessage = msg => {
      const message = JSON.parse(msg.data);

      switch (message.type) {
        // Handshake
        case 'handshake': {
          if (message.ok) {
            setInitLoading(false);
            setTitle(message.title);
            setScramble(message.scramble);
            message.players.forEach(player => {
              addPlayer({ ...player, name: player.username });
            });

            if (!spectate) {
              addPlayer({
                id: websocketOpts.id,
                name: message.me.username,
                times: message.me.times,
                ready: message.me.ready,
                sitOut: message.me.sitOut,
                admin: message.me.admin
              });
              setReady(message.me.ready);
              handleChange({
                target: { name: 'sitOut', value: message.me.sitOut }
              });
            }
          }
          break;
        }

        // Player Ready

        case 'playerReady': {
          const copy = players;
          const playerIdx = copy.findIndex(p => p.name === message.username);
          if (playerIdx < 0) {
            break;
          }
          copy[playerIdx].ready = message.ready;
          setPlayers([...copy]);
          break;
        }

        // Player Sit Out

        case 'playerSitOut': {
          const copy = players;
          const playerIdx = copy.findIndex(p => p.name === message.username);
          if (playerIdx < 0) {
            break;
          }
          copy[playerIdx].sitOut = message.sitOut;
          setPlayers([...copy]);
          break;
        }

        // Player Join

        case 'playerJoin': {
          addPlayer({
            name: message.username,
            times: message.times || [],
            ready: false,
            sitOut: false,
            admin: false
          });
          toast.addToast({
            title: 'New Player',
            text: `${message.username} joined the room`,
            delay: 5000,
            variant: 'success'
          });
          break;
        }

        // Player Leave

        case 'playerLeave': {
          const copy = players;
          const idx = players.findIndex(p => p.name === message.username);
          if (idx < 0) {
            break;
          }
          copy.splice(idx, 1);
          setPlayers([...copy]);
          toast.addToast({
            title: 'Player Left',
            text: `${message.username} left the room`,
            delay: 5000,
            variant: 'warning'
          });
          break;
        }

        // All Ready

        case 'allReady': {
          setPlaying(true);
          if (!spectate && !me().sitOut) {
            setUsingTimer(true);
            players.forEach(p => (p.ready = false));
          }
          break;
        }

        // Player Time

        case 'playerTime': {
          const copy = players;
          const idx = copy.findIndex(p => p.name === message.username);
          if (idx < 0) {
            break;
          }
          copy[idx].times.unshift({
            time: message.time,
            dnf: message.dnf,
            won: false
          });
          setPlayers([...copy]);
          break;
        }

        case 'scramble': {
          setScramble(message.scramble);
          break;
        }

        // Everybody is done timing

        case 'allFinished': {
          setPlaying(false);
          if (!message.winner) break;

          const copy = players;
          const idx = copy.findIndex(p => p.name === message.winner);
          if (idx < 0) {
            break;
          }
          copy[idx].times[0].won = true;

          // Sit out times, and reset ready
          copy.forEach(p => {
            if (message.satOut.includes(p.name)) {
              p.times.unshift({
                time: '---',
                dnf: false,
                won: false
              });
            }
            p.ready = false;
          });

          // Set players
          setPlayers([...copy]);
          break;
        }

        // Chat

        case 'chat': {
          setChatMessages(curr => {
            return curr + `${message.username}: ${message.str}\n`;
          });
          break;
        }

        // Event

        case 'event': {
          setEvent(message.event);
          break;
        }

        // New Admin
        case 'newadmin': {
          me().admin = true;
          toast.addToast({
            title: 'Message From Server',
            text: 'You are the new room admin',
            delay: 5000
          });
          break;
        }
      }
    };

    ws.current.onclose = e => {
      if (e.code !== 1000) {
        toast.addToast({
          title: 'Disconnected',
          text: `You've been disconnected from the server: ${
            e.reason || 'Unknown reason'
          }`,
          delay: 5000,
          variant: 'error'
        });
      }
    };
  }, [websocketOpts, spectate]);

  // Listen for sitOut
  useEffect(() => {
    ws.current?.send(
      JSON.stringify({
        type: 'sitOut',
        id: websocketOpts.id,
        sitOut: values.sitOut
      })
    );
  }, [values.sitOut]);

  // Listen for game state changes
  useEffect(() => {
    // Edit time
    if (gameState.editTime) {
      const input = editTimeInput.current;

      setEditTimeValue(fmtTime(gameState.time));
      input.focus();

      const finish = (discard = false) => {
        setGameState(gameState => ({
          time: discard ? gameState.time : parseFloat(input.value) * 1000,
          editTime: false
        }));
        input.removeEventListener('blur', finish);
        input.removeEventListener('keydown', keydown);
      };

      const keydown = e => {
        if (e.key == 'Enter') finish();
        if (e.key == 'Escape') finish(true);
      };

      input.addEventListener('blur', () => finish());
      input.addEventListener('keydown', keydown);
    }

    // Update the running time for display
    if (gameState.timerIsRunning && !gameState.runningCallback) {
      const callback = setInterval(() => {
        setRunningTime(Date.now() - gameState.startTime);
      }, 10);

      setGameState(gameState => ({
        ...gameState,
        runningCallback: callback
      }));
    }

    // Stop updating the time for display
    if (!gameState.timerIsRunning && gameState.runningCallback) {
      clearInterval(gameState.runningCallback);
      setGameState(gameState => ({
        ...gameState,
        runningCallback: null
      }));
    }
  }, [gameState]);

  // Handle listeners on the window for play
  useEffect(() => {
    if (usingTimer) {
      window.addEventListener('keydown', keyDownListener);
      window.addEventListener('keyup', keyUpListener);
      timerModal.current.addEventListener('touchstart', keyDownListener);
      timerModal.current.addEventListener('touchend', keyUpListener);
      timerEvents.current = [
        ...timerEvents.current,
        { event: 'keydown', listener: keyDownListener, ref: window },
        { event: 'keyup', listener: keyUpListener, ref: window },
        {
          event: 'touchstart',
          listener: keyDownListener,
          ref: timerModal.current
        },
        { event: 'touchend', listener: keyUpListener, ref: timerModal.current }
      ];
    } else {
      clearListeners();
    }

    return clearListeners;
  }, [usingTimer, gameState]);

  useEffect(() => {
    if (usingTimer) {
      setGameState({
        time: 0,
        editTime: false,
        timerIsPrimed: false,
        timerIsRunning: false,
        runningCallback: null,
        startTime: 0
      });
    }
  }, [usingTimer]);

  const addPlayer = ({ id, name, times, ready, sitOut, admin }) => {
    const copy = players;
    copy.push({
      id: id || cuid(),
      name,
      times,
      ready,
      sitOut,
      admin
    });

    // Ensure we are the first player
    if (copy[0].id !== websocketOpts.id) {
      const idx = copy.findIndex(p => p.id === websocketOpts.id);
      const player = copy.splice(idx, 1);
      copy.unshift(...player);
    }

    setPlayers([...copy]);
  };

  const sendChat = str => {
    ws.current?.send(
      JSON.stringify({
        type: 'chat',
        id: websocketOpts.id,
        str
      })
    );
  };

  // This is useful as a callback because we need to reference it
  // more than once, and defining it outside of useEffect is cheaper
  const clearListeners = () => {
    timerEvents.current.forEach(md => {
      const { event, listener, ref } = md;
      ref.removeEventListener(event, listener);
    });
    timerEvents.current = [];
  };

  // Timer events
  const keyDownListener = useCallback(
    e => {
      if (e.repeat === true) return;

      if (
        e.type === 'touchstart' &&
        (e.target.classList.contains('touchable') || gameState.editTime) &&
        !gameState.timerIsRunning
      ) {
        return;
      }

      if (
        e.code == 'Space' ||
        e.type === 'touchstart' ||
        gameState.timerIsRunning
      ) {
        if (e.type === 'touchstart') e.stopPropagation();
        e.preventDefault();

        // 1. Space down to prime
        if (!gameState.timerIsRunning && !gameState.timerIsPrimed) {
          setGameState({
            ...gameState,
            timerIsPrimed: true
          });
        } // 3. Space down to stop the timer
        else if (gameState.timerIsRunning) {
          const done = Date.now();
          setGameState({
            ...gameState,
            time: done - gameState.startTime,
            timerIsRunning: false
          });
        }
      }
    },
    [gameState]
  );

  const keyUpListener = useCallback(
    e => {
      if (e.repeat === true) return;

      if (e.code == 'Space' || e.type === 'touchend') {
        if (e.type === 'keyup') {
          e.preventDefault();
        } else {
          e.stopPropagation();
        }

        // 2. Space up to start the timer
        if (gameState.timerIsPrimed) {
          const now = Date.now();
          setGameState({
            ...gameState,
            startTime: now,
            timerIsPrimed: false,
            timerIsRunning: true
          });
        }
      }
    },
    [gameState]
  );

  const changeEvent = e => {
    ws.current?.send(
      JSON.stringify({
        type: 'event',
        id: websocketOpts.id,
        event: e
      })
    );
    setEvent(e);
  };

  // Get my player
  const me = useCallback(() => {
    if (spectate) {
      return { id: '', name: '', sitOut: false, ready: false, times: [] };
    }
    return players.find(x => x.id === websocketOpts.id);
  }, [players, websocketOpts]);

  // Set myself as ready
  const setReady = useCallback(() => {
    ws.current?.send(
      JSON.stringify({
        type: 'ready',
        id: websocketOpts.id,
        ready: true
      })
    );
  }, [players]);

  // Submit time
  const submitTime = useCallback(
    ({ dnf, plus2 }) => {
      // DNF
      if (dnf) {
        ws.current?.send(
          JSON.stringify({
            type: 'time',
            id: websocketOpts.id,
            dnf: true
          })
        );
      }

      // +2
      let time = gameState.time;
      if (plus2) {
        time += 2000;
      }

      // Send time
      ws.current?.send(
        JSON.stringify({
          type: 'time',
          id: websocketOpts.id,
          time
        })
      );

      // Hide timer
      setUsingTimer(false);
    },
    [gameState, players]
  );

  const kickPlayer = useCallback(
    username => {
      ws.current?.send(
        JSON.stringify({
          type: 'kick',
          id: websocketOpts.id,
          username
        })
      );
    },
    [websocketOpts]
  );

  // Compute ready fraction
  const readyFraction = () => {
    const readyCount = players.filter(x => x.ready).length;
    const playingCount = players.filter(x => !x.sitOut).length;

    return `${readyCount}/${playingCount}`;
  };

  // Format ms:number to string
  const fmtTime = ms => {
    const seconds = Math.floor(ms / 1000);
    const remainder = (ms % 1000).toString().padStart(3, '0');
    return `${seconds}.${remainder}`;
  };

  if (initLoading) {
    // 4b. Send the password to the server
    const sendPassword = async () => {
      setRoomPassword(passForm.room_pass);
      passModal.close();
    };

    return (
      <>
        <Title>Loading...</Title>
        <Navbar current="rooms" />
        <p className="text-xl italic font-semibold text-center mt-5">
          Loading...
        </p>

        <Modal
          title="Private Room"
          modal={passModal}
          canClose={false}
        >
          <div className="relative h-full mt-5">
            <p className="text-xl text-center mb-5">
              This room is private, and requires a password to join.
            </p>
            <Input
              id="room_pass"
              type="password"
              value={passForm.room_pass}
              onChange={handlePassForm}
              placeholder="Room Password"
            />
            <div className="absolute bottom-14 w-full text-center">
              <Button
                onClick={sendPassword}
                variant="green"
              >
                Submit
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  // Render it
  return (
    <>
      <div className="min-h-screen">
        <Title>{title || ''}</Title>
        <Navbar current="rooms" />
        <div>
          <div className="w-[95%] md:w-[90%] mx-auto mt-5 bg-zinc-200 md:min-h-32 rounded-md shadow-lg p-3 dark:bg-zinc-900">
            <h3 className="text-2xl md:text-3xl font-mono text-center">
              {scramble}
            </h3>
            {!spectate && (
              <div className="grid gap-2 md:grid-cols-3 items-center mt-3 mx-3">
                <div className="self-end justify-self-center md:justify-self-start">
                  <span
                    className="text-lg !text-blue-500 cursor-pointer"
                    onClick={() => shareModal.open()}
                  >
                    <span className="mr-2">Share</span>
                    <FontAwesomeIcon icon={faShareFromSquare} />
                  </span>
                </div>
                <div className="justify-self-center items-center flex">
                  <Button
                    variant="green"
                    className="font-black mr-2 justify-self-center"
                    onClick={() => setReady()}
                    disabled={!me() || me().ready || me().sitOut || playing}
                  >
                    READY ({readyFraction()})
                  </Button>
                  <Switch
                    id="sitOut"
                    value={values.sitOut}
                    onChange={handleChange}
                    label="Sit Out"
                    className="justify-self-end items-center"
                  />
                </div>
                <div className="justify-self-center md:justify-self-end w-1/2">
                  <Dropdown
                    options={[
                      { name: '3x3x3', value: '333' },
                      { name: '2x2x2', value: '222' },
                      { name: '4x4x4', value: '444' },
                      { name: '5x5x5', value: '555' },
                      { name: '6x6x6', value: '666' },
                      { name: '7x7x7', value: '777' },
                      { name: 'Clock', value: 'clock' },
                      { name: 'Megaminx', value: 'minx' },
                      { name: 'Pyraminx', value: 'pyram' },
                      { name: 'Skewb', value: 'skewb' },
                      { name: 'Square-1', value: 'sq1' }
                    ]}
                    selected={event}
                    onChange={changeEvent}
                    disabled={!me() || !me().admin}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="player-container mt-6 overflow-x-scroll whitespace-nowrap w-full h-full">
            {players.map(player => (
              <Fragment key={player.id}>
                <RoomPlayer
                  me={player.id === me().id}
                  name={player.name}
                  times={player.times}
                  ready={player.ready}
                  sitOut={player.sitOut}
                  showAdmin={me().admin}
                  onKick={() => {
                    kickPlayer(player.name);
                  }}
                />
              </Fragment>
            ))}
          </div>
          {usingTimer && !me().sitOut && (
            <div
              className="absolute top-0 left-0 w-screen h-screen bg-black/[0.8]"
              ref={timerModal}
            >
              <div
                className="absolute h-1/2 md:h-2/5 bg-zinc-300 dark:bg-zinc-800 w-full"
                style={{ top: '50%', transform: 'translate(0, -50%)' }}
              >
                <div className="text-[96px] font-mono mt-10">
                  {gameState.editTime ? (
                    <input
                      ref={editTimeInput}
                      className="w-full bg-inherit text-center focus:outline-none"
                      value={editTimeValue}
                      onChange={e => setEditTimeValue(e.target.value)}
                    />
                  ) : (
                    <p className="text-center">
                      {gameState.timerIsRunning && (
                        <span className="text-green-600 dark:text-green-500">
                          {fmtTime(runningTime)}
                        </span>
                      )}
                      {gameState.timerIsPrimed && (
                        <span className="text-blue-600 dark:text-blue-500">
                          0.000
                        </span>
                      )}
                      {!gameState.timerIsRunning &&
                        !gameState.timerIsPrimed && (
                          <span>{fmtTime(gameState.time)}</span>
                        )}
                    </p>
                  )}
                </div>
                <div className="text-center -mt-5">
                  <p className="hidden md:block">
                    {gameState.editTime ? (
                      <>
                        Press <Kbd>Enter</Kbd> or click away to save time
                      </>
                    ) : (
                      <>
                        Use <Kbd>Space</Kbd> to start and stop
                      </>
                    )}
                  </p>
                  <p className="md:hidden">
                    {gameState.editTime ? (
                      <>
                        Press <Kbd>Enter</Kbd> or tap away to save time
                      </>
                    ) : (
                      <>Press and hold anywhere to start and stop</>
                    )}
                  </p>
                </div>
                <p className="text-center mt-2">
                  <span
                    className="text-blue-500 cursor-pointer hover:underline touchable"
                    onClick={() => setGameState({ ...gameState, time: 0 })}
                  >
                    Reset
                  </span>
                  &nbsp;or&nbsp;
                  <span
                    className="text-blue-500 cursor-pointer hover:underline touchable"
                    onClick={() =>
                      setGameState({ ...gameState, editTime: true })
                    }
                  >
                    enter manually
                  </span>
                </p>
                <div className="absolute bottom-5 w-full text-center">
                  <Button
                    variant="red"
                    className="font-bold touchable"
                    onClick={() => submitTime({ dnf: true })}
                    disabled={gameState.time === 0 || gameState.timerIsRunning}
                  >
                    DNF
                  </Button>
                  <Button
                    variant="neutral"
                    className="ml-2 font-bold touchable"
                    onClick={() => {
                      submitTime({ plus2: true });
                    }}
                    disabled={gameState.time === 0 || gameState.timerIsRunning}
                  >
                    +2
                  </Button>
                  <Button
                    variant="neutral"
                    className="ml-2 font-bold touchable"
                    onClick={submitTime}
                    disabled={gameState.time === 0 || gameState.timerIsRunning}
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </div>
          )}
          <Chat
            onSend={sendChat}
            messages={chatMessages}
          />
        </div>
      </div>

      {/* Share Modal */}
      <Modal
        title="Share Room"
        modal={shareModal}
        canClose={true}
      >
        <div className="relative h-full mt-5">
          <span className="text-lg">Join Link</span>
          <div className="mb-2 flex items-center">
            <Input
              value={`${process.env.NEXT_PUBLIC_WEB_URL}/rooms/${router.query.id}`}
              className="grow mr-2"
            />
            <Button
              onClick={() => {
                window.navigator.clipboard
                  .writeText(
                    `${process.env.NEXT_PUBLIC_WEB_URL}/rooms/${router.query.id}`
                  )
                  .then(() => {
                    toast.addToast({
                      title: 'Link Copied',
                      text: 'Join link copied to clipboard!',
                      delay: 3000,
                      variant: 'secondary'
                    });
                  });
              }}
            >
              Copy
            </Button>
          </div>
          <span className="text-lg">Spectate Link</span>
          <div className="mb-2 flex items-center">
            <Input
              value={`${process.env.NEXT_PUBLIC_WEB_URL}/rooms/${router.query.id}?spectate=true`}
              className="grow mr-2"
            />
            <Button
              onClick={() => {
                window.navigator.clipboard
                  .writeText(
                    `${process.env.NEXT_PUBLIC_WEB_URL}/rooms/${router.query.id}?spectate=true`
                  )
                  .then(() => {
                    toast.addToast({
                      title: 'Link Copied',
                      text: 'Spectate link copied to clipboard!',
                      delay: 3000,
                      variant: 'secondary'
                    });
                  });
              }}
            >
              Copy
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default OneRoomPage;
