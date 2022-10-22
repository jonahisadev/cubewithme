import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEllipsis,
  faCircleCheck,
  faCircleMinus,
  faCircle
} from '@fortawesome/free-solid-svg-icons';
import Popover, { usePopover } from './Popover';
import Button from './Button';
import axios from 'axios';

const RoomPlayer = ({ me, name, times, ready, sitOut, showAdmin, onKick }) => {
  const [image, setImage] = useState('pfp.jpg');
  const popover = usePopover(false);

  const average = total => {
    if (times.length < total) return 'DNF';

    let timeList = [];

    // Compile list
    for (let i = 0; i < total; i++) {
      // Time
      const time = times[i];

      // Skip sit-outs
      if (typeof time.time === 'string') continue;

      // Handle DNF's
      if (time.dnf) {
        timeList.push(Infinity);
      } else {
        timeList.push(time.time);
      }
    }

    // Two or more DNF's result in average DNF
    if (timeList.filter(x => x === Infinity).length >= 2) {
      return 'DNF';
    }

    // Sort
    timeList.sort((a, b) => a - b);

    // Remove best and worst time
    timeList.shift();
    timeList.pop();

    // Return average
    return formatTime(
      Math.round(timeList.reduce((prev, curr) => prev + curr, 0) / (total - 2))
    );
  };

  const ao5 = () => {
    return average(5);
  };

  const ao12 = () => {
    return average(12);
  };

  const averages = {
    ao5: ao5,
    ao12: ao12
  };

  // Load in player image
  useEffect(() => {
    axios
      .get(`/api/users/@${name}`)
      .then(res => {
        setImage(res.data.user.pfp);
      })
      .catch(_err => {
        // We can ignore this, but we want to stop the page from crashing
      });
  }, []);

  // Position popover
  const handle = useRef();
  useEffect(() => {
    if (handle.current) {
      const rect = handle.current.getBoundingClientRect();
      popover.setPosition({
        x: rect.x - popover.size.width + rect.width + 15,
        y: rect.y - popover.size.height - 5
      });
    }
  }, [popover.show]);

  const formatTime = time => {
    // This is for the sit out
    if (typeof time === 'string') return time;

    // This is for times
    const str = String(time).padStart(4, '0');
    return `${str.substring(0, str.length - 3)}.${str.substring(
      str.length - 3
    )}`;
  };

  return (
    <div className="inline-grid mx-3 mb-5 grid-flow-row max-w-[80%] md:max-w-[25%] w-full">
      <Popover popover={popover}>
        <h3 className="text-center font-bold text-lg">{name}</h3>
        <div className="text-center mt-3">
          <Button
            as="a"
            variant="red"
            onClick={onKick}
          >
            Kick
          </Button>
        </div>
      </Popover>
      <a
        href={`/user/${name}`}
        target="_blank"
      >
        <img
          src={`https://cubewithme.s3.us-east-2.amazonaws.com/images/${image}`}
          className="hidden md:block w-[40%] md:w-1/2 mx-auto rounded-full shadow-md mb-2"
        />
      </a>
      <div className={'text-center text-2xl grid grid-cols-3 items-center'}>
        <div className="justify-self-start ml-2 text-lg">
          {ready && (
            <FontAwesomeIcon
              icon={faCircleCheck}
              className="text-green-500 dark:text-green-400"
            />
          )}
          {sitOut && (
            <FontAwesomeIcon
              icon={faCircleMinus}
              className="text-blue-500 dark:text-blue-400"
            />
          )}
          {!ready && !sitOut && (
            <FontAwesomeIcon
              icon={faCircle}
              className="text-zinc-400 dark:text-zinc-500"
            />
          )}
        </div>
        <span
          className={`justify-self-center ${
            me && '!text-blue-500 dark:!text-blue-400'
          }`}
        >
          {name}
        </span>
        {showAdmin && !me ? (
          <>
            <span
              ref={handle}
              onClick={popover.toggle}
              className="justify-self-end cursor-pointer text-xl mr-2"
            >
              <FontAwesomeIcon icon={faEllipsis} />
            </span>
          </>
        ) : (
          <div />
        )}
      </div>
      <table className="w-full text-center rounded-md shadow-lg mt-2 font-mono">
        <tbody>
          {Object.keys(averages).map((avg, i) => (
            <tr key={Date.now() + i}>
              <td className="border-2 font-bold text-sm py-0.5 border-b border-zinc-600 bg-zinc-200 dark:border-zinc-900 dark:bg-zinc-600 grid grid-cols-2 gap-x-2">
                <p className="text-right">{avg}:</p>
                <p className="text-left">{averages[avg]()}</p>
              </td>
            </tr>
          ))}
          {times.map((state, i) => (
            <tr
              key={Date.now() + i}
              className={`border-2 border-zinc-600 bg-zinc-100 dark:border-zinc-900 dark:bg-zinc-700 ${
                state.won ? '!bg-blue-400 dark:!bg-blue-500' : ''
              } ${!state.time ? '!bg-red-400 dark:!bg-red-500' : ''}`}
            >
              <td className="text-xl">
                {state.dnf ? 'DNF' : formatTime(state.time)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RoomPlayer;
