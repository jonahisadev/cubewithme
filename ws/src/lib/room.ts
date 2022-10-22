import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { AddressInfo } from 'net';
import { v4 as uuid } from 'uuid';
import { OutMessage, InMessage, Time } from './types.js';
import { Player, Spectator } from './player.js';
import ports from './ports.js';
import { exclude, findPlayerById, removeUser, removeRoom } from './index.js';
import database from './database.js';
import { scramble, ScrambleEvent } from './scramble.js';

interface TimeBuffer {
  players: {
    id: string;
    time: Time;
  }[];
  remaining: string[];
}

class Room {
  id: string;
  wss: WebSocketServer;
  port: number = 0;
  clients: Map<string, Player>;
  spectators: Spectator[];
  killTimeout: NodeJS.Timeout | null;

  title: string;
  event: ScrambleEvent;
  scramble: string;
  playing: boolean;
  timeBuffer: TimeBuffer;

  private constructor(wss: WebSocketServer, title: string) {
    this.id = uuid();
    this.wss = wss;
    this.clients = new Map<string, Player>();
    this.spectators = [];
    this.killTimeout = null;

    this.title = title;
    this.event = '333';
    this.playing = false;
    this.timeBuffer = { players: [], remaining: [] };
    this.scramble = 'Loading...';

    this.generateScramble();
  }

  private async handleMessage(data: string, ws: WebSocket) {
    const payload = JSON.parse(data) as InMessage;

    console.log(`<${payload.id}> -> received '${payload.type}'`);
    switch (payload.type) {
      // Handshake
      case 'handshake': {
        // Enforce size limit
        if (this.clients.size === 10) {
          ws.send(
            JSON.stringify({
              type: 'handshake',
              ok: false
            })
          );
          ws.close(1008, 'Room is full');
        }

        // Handshake from spectator
        if (payload.spectate) {
          // Set up spectator
          const spectator = await Spectator.create();
          spectator.socket = ws;
          this.spectators.push(spectator);

          // Send state
          this.send(spectator.id, {
            type: 'handshake',
            ok: true,
            title: this.title,
            event: this.event,
            players: Array.from(this.clients.values()).map(x =>
              exclude({ ...x }, 'socket', 'id')
            ),
            scramble: this.scramble
          });

          // Send spectator count
          this.broadcast({
            type: 'spectate',
            count: this.spectators.length
          });
          return;
        }

        // Find player in global store
        const player = await findPlayerById(payload.id);
        if (!player) {
          ws.send(
            JSON.stringify({
              type: 'handshake',
              ok: false
            })
          );
          ws.close(1008, 'Did not register');
          break;
        }

        // Check that they are not in another room currently
        if (player.socket) {
          ws.close(1008, 'You are already in a room');
          return;
        }

        // Check if there's a room id and if it's ours
        if (player.room_id && player.room_id !== this.id) {
          player.admin = false;
          player.ready = false;
          player.sitOut = false;
          player.times = [];
        }

        // Stop server death
        if (this.killTimeout) {
          clearTimeout(this.killTimeout);
        }

        // First player is admin
        if (this.clients.size === 0) {
          player.admin = true;
        }

        // Init client and add to map
        player.socket = ws;
        player.room_id = this.id;
        this.clients.set(player.id, player);

        // Send initial game state game state
        this.send(player.id, {
          type: 'handshake',
          ok: true,
          title: this.title,
          event: this.event,
          me: exclude({ ...player }, 'socket'),
          players: Array.from(this.clients.values())
            .filter(x => x.id !== player!.id)
            .map(x => exclude({ ...x }, 'socket', 'id')),
          scramble: this.scramble
        });

        // Broadcast new player
        this.broadcast(
          {
            type: 'playerJoin',
            username: player.username,
            times: player.times
          },
          player.id
        );

        // Update player_count
        this.updatePlayerCount();
        break;
      }

      // Ready
      case 'ready': {
        if (this.playing) {
          return;
        }

        const player = await findPlayerById(payload.id);
        if (!player) {
          return;
        }

        player.ready = payload.ready;
        this.clients.set(player.id, player);

        // Tell everyone
        this.broadcast({
          type: 'playerReady',
          username: player.username,
          ready: player.ready
        });

        break;
      }

      // Sit Out
      case 'sitOut': {
        const player = await findPlayerById(payload.id);
        if (!player) {
          return;
        }

        // During round, don't allow sit out during player solve
        if (this.playing) {
          const remIdx = this.timeBuffer.remaining.findIndex(
            x => x === payload.id
          );
          if (remIdx >= 0) {
            return;
          }
        }

        player.sitOut = payload.sitOut;
        this.clients.set(player.id, player);

        this.broadcast({
          type: 'playerSitOut',
          username: player.username,
          sitOut: player.sitOut
        });

        break;
      }

      // Player time
      case 'time': {
        // Don't accept times if we're not all playing
        if (!this.playing) {
          return;
        }

        // Player has already submitted a time
        const idx = this.timeBuffer.players.findIndex(p => p.id === payload.id);
        if (idx >= 0) {
          return;
        }

        // Save time to buffer
        this.timeBuffer.players.push({
          id: payload.id,
          time: {
            time: payload.time,
            dnf: payload.dnf,
            won: false
          }
        });

        // Remove player from remaining list
        const remIdx = this.timeBuffer.remaining.findIndex(
          x => x === payload.id
        );
        this.timeBuffer.remaining.splice(remIdx, 1);

        // Tell everyone else
        const player = this.clients.get(payload.id);
        this.broadcast({
          type: 'playerTime',
          username: player!.username,
          time: payload.time,
          dnf: payload.dnf
        });
        break;
      }

      // Kick player
      case 'kick': {
        // Request is from admin
        const isAdmin = this.clients.get(payload.id)?.admin;
        if (!isAdmin) {
          return;
        }

        // Player exists
        const player = Array.from(this.clients.values()).find(
          p => p.username === payload.username
        );
        if (!player) {
          return;
        }

        // Request is not for self
        if (payload.id === player.id) {
          return;
        }

        // Close websocket
        player.socket?.close(1008, 'Kicked by admin');

        break;
      }

      // Chat
      case 'chat': {
        const player = this.clients.get(payload.id);
        if (!player) {
          return;
        }

        this.broadcast({
          type: 'chat',
          username: player.username,
          str: payload.str
        });
        break;
      }

      case 'event': {
        // Validate player
        const player = this.clients.get(payload.id);
        if (!player || !player.admin) {
          return;
        }

        // Set event and generate new scramble
        this.event = payload.event;
        await this.generateScramble();

        // Let everyone else know
        this.broadcast(
          {
            type: 'event',
            event: this.event
          },
          [player.id]
        );
        break;
      }

      default:
        break;
    }

    this.gameTick();
  }

  private async generateScramble() {
    this.scramble = await scramble(this.event);
    this.broadcast({
      type: 'scramble',
      scramble: this.scramble
    });
  }

  private updatePlayerCount() {
    database.query(
      `UPDATE "room" SET "player_count"='${this.clients.size}' WHERE "their_id"='${this.id}';`
    );
  }

  private handleClose(ws: WebSocket): void {
    const player = Array.from(this.clients.values()).find(p => p.socket == ws);
    if (player) {
      // Delete player from list
      this.clients.delete(player.id);

      // Tell everyone else
      this.broadcast({
        type: 'playerLeave',
        username: player.username
      });

      // Remove player from timebuffer if they were playing
      if (this.playing) {
        const remIdx = this.timeBuffer.remaining.findIndex(
          x => x === player.id
        );
        if (remIdx >= 0) {
          this.timeBuffer.remaining.splice(remIdx, 1);
        }
      }

      // Break socket
      player.socket = undefined;

      // Update player_count
      this.updatePlayerCount();

      // Log
      console.log(`Player <${player.id}> disconnected`);

      // Check for empty room
      if (this.clients.size === 0) {
        console.log('Server empty; closing in 30 seconds');
        this.killTimeout = setTimeout(async () => {
          await database.query(
            `DELETE FROM "room" WHERE "their_id" = '${this.id}';`
          );
          this.wss.close();
          await removeRoom(this.id);
          console.log('Room has closed');
        }, 30 * 1000);
      }
    } else {
      console.log('Unknown player disconnected');
    }

    // Just for good measure
    this.gameTick();
  }

  private send(id: string, data: OutMessage): void {
    const player =
      this.clients.get(id) || this.spectators.find(x => x.id === id);
    if (!player) {
      return;
    }

    console.log(`send '${data.type}' -> <${id}>`);
    player.socket?.send(JSON.stringify(data));
  }

  private broadcast(data: OutMessage, exclude?: string[] | string): void {
    const excludeArr = Array.isArray(exclude) ? exclude : [exclude];
    this.clients.forEach(client => {
      if (!excludeArr.includes(client.id)) {
        this.send(client.id, data);
      }
    });
    this.spectators.forEach(client => {
      this.send(client.id, data);
    });
  }

  private gameTick() {
    const players = Array.from(this.clients.values());

    // Check if we should start the round
    if (!this.playing) {
      const canPlay = players.filter(p => !p.sitOut).length;
      const areReady = players.filter(p => p.ready);

      if (canPlay === areReady.length && canPlay > 0) {
        this.playing = true;
        this.broadcast({
          type: 'allReady'
        });

        this.timeBuffer = {
          players: [],
          remaining: areReady.map(x => x.id)
        };
      }
    } else {
      // Check for the end of the round
      if (this.timeBuffer.remaining.length === 0) {
        // Find the winner ID
        const winnerId = this.timeBuffer.players
          .filter(p => !p.time.dnf)
          .sort((a, b) => a.time.time! - b.time.time!)
          .at(0)?.id;

        console.log(`Winner: <${winnerId}>`);

        // Find player
        let winner: Player | undefined;
        if (winnerId) {
          winner = this.clients.get(winnerId);
        }

        const players = Array.from(this.clients.values());

        // Send out the winner
        this.broadcast({
          type: 'allFinished',
          winner: winner?.username || null,
          satOut: players
            .filter(p => {
              return (
                p.sitOut && !this.timeBuffer.players.find(x => x.id === p.id)
              );
            })
            .map(x => x.username)
        });

        // Add all times to the players
        this.timeBuffer.players.forEach(p => {
          const client = this.clients.get(p.id);
          if (!client) return;
          client.times.unshift({
            time: p.time.time,
            dnf: p.time.dnf,
            won: p.id === winnerId
          });
          client.ready = false;
        });

        // Reset state
        this.timeBuffer = { players: [], remaining: [] };
        this.playing = false;
        this.generateScramble();
      }
    }
  }

  setup(): void {
    // Move actual callbacks somewhere
    this.wss.on('connection', ws => {
      ws.on('message', data => this.handleMessage(data.toString(), ws));
      ws.on('close', () => this.handleClose(ws));
    });
  }

  static async create(title: string): Promise<Room> {
    return new Promise((res, rej) => {
      const server = createServer({});
      const wss = new WebSocketServer({ server });

      const room = new Room(wss, title);

      const listener = server.listen(ports.take(), () => {
        if (!listener.address()) {
          rej('Could not create server');
          return;
        }
        room.port = (listener.address() as AddressInfo).port;
        res(room);
      });

      // Handle close and give port back
      server.on('close', () => {
        console.log(`WSS server on port ${room.port} closed`);
        ports.give(room.port);
      });
    });
  }
}

export default Room;
