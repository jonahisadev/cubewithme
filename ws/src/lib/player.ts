import { WebSocket } from 'ws';
import cuid from 'cuid';
import { Time } from './types.js';

export class Player {
  id: string;
  room_id: string | null;
  socket?: WebSocket;

  username: string;
  admin: boolean;
  times: (Time | null)[];
  ready: boolean;
  sitOut: boolean;

  // TODO: we need more fields here for sure

  private constructor(id: string, room_id: string | null, username: string) {
    this.id = id;
    this.room_id = room_id;
    this.username = username;
    this.admin = false;
    this.ready = false;
    this.sitOut = false;
    this.times = [];
  }

  static async create(
    username: string,
    room_id: string | null
  ): Promise<Player> {
    const id = cuid();
    return new Player(id, room_id, username);
  }
}

export class Spectator {
  id: string;
  socket?: WebSocket;

  private constructor(id: string) {
    this.id = id;
  }

  static async create(): Promise<Spectator> {
    const id = cuid();
    return new Spectator(id);
  }
}
