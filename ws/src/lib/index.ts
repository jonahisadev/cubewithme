import Room from './room.js';
import { Player } from './player.js';
import { g_rooms, g_players } from './globals.js';

export const createRoom = async (title: string): Promise<Room> => {
  const room = await Room.create(title);
  room.setup();
  g_rooms.push(room);
  return room;
};

export const removeRoom = async (id: string) => {
  const idx = g_rooms.findIndex(r => r.id === id);
  const room = g_rooms[idx];
  const players = g_players.filter(x => x.room_id === room.id);
  players.forEach(p => {
    removeUser(p.username);
  });
  g_rooms.splice(idx, 1);
};

export const registerUser = async (
  username: string,
  room_id: string | null
): Promise<Player> => {
  const findPlayer = g_players.find(x => x.username === username);
  if (findPlayer) {
    throw new Error('Player already exists');
  }

  const player = await Player.create(username, room_id);
  g_players.push(player);
  return player;
};

export const removeUser = async (username: string) => {
  const idx = g_players.findIndex(x => x.username === username);
  if (idx < 0) {
    return;
  }

  g_players.splice(idx, 1);
};

export const findPlayerById = async (
  id: string
): Promise<Player | undefined> => {
  const player = g_players.find(p => p.id === id);
  return player;
};

export function exclude<T, Key extends keyof T>(
  obj: T,
  ...keys: Key[]
): Omit<T, Key> {
  for (let key of keys) {
    delete obj[key];
  }
  return obj;
}
