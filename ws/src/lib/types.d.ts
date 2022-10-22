import { Player } from './player';
import { ScrambleEvent } from './scramble';

export interface OutMessageHandshake {
  type: 'handshake';
  ok: boolean;
  title: string;
  event: ScrambleEvent;
  me?: Omit<Player, 'socket'>;
  players: Omit<Player, 'socket' | 'id'>[];
  scramble: string;
}

export interface OutMessagePlayerJoin {
  type: 'playerJoin';
  username: string;
  times: (Time | null)[];
}

export interface OutMessagePlayerLeave {
  type: 'playerLeave';
  username: string;
}

export interface OutMessagePlayerReady {
  type: 'playerReady';
  username: string;
  ready: boolean;
}

export interface OutMessagePlayerSitOut {
  type: 'playerSitOut';
  username: string;
  sitOut: boolean;
}

export interface OutMessageAllReady {
  type: 'allReady';
}

export interface OutMessagePlayerTime {
  type: 'playerTime';
  username: string;
  time?: number;
  dnf?: boolean;
}

export interface OutMessageAllFinished {
  type: 'allFinished';
  winner: string | null;
  satOut: string[];
}

export interface OutMessageScramble {
  type: 'scramble';
  scramble: string;
}

export interface OutMessageSpectate {
  type: 'spectate';
  count: number;
}

export interface OutMessageChat {
  type: 'chat';
  username: string;
  str: string;
}

export interface OutMessageEvent {
  type: 'event';
  event: ScrambleEvent;
}

export type OutMessage =
  | OutMessageHandshake
  | OutMessagePlayerJoin
  | OutMessagePlayerLeave
  | OutMessagePlayerReady
  | OutMessagePlayerSitOut
  | OutMessageAllReady
  | OutMessagePlayerTime
  | OutMessageAllFinished
  | OutMessageScramble
  | OutMessageSpectate
  | OutMessageChat
  | OutMessageEvent;

export interface InMessageHandshake {
  type: 'handshake';
  id: string;
  spectate: boolean;
}

export interface InMessageReady {
  type: 'ready';
  id: string;
  ready: boolean;
}

export interface InMessageSitOut {
  type: 'sitOut';
  id: string;
  sitOut: boolean;
}

export interface InMessageTime {
  type: 'time';
  id: string;
  time?: number;
  dnf?: boolean;
}

export interface InMessageKick {
  type: 'kick';
  id: string;
  username: string;
}

export interface InMessageChat {
  type: 'chat';
  id: string;
  str: string;
}

export interface InMessageEvent {
  type: 'event';
  id: string;
  event: ScrambleEvent;
}

export type InMessage =
  | InMessageHandshake
  | InMessageReady
  | InMessageSitOut
  | InMessageTime
  | InMessageKick
  | InMessageChat
  | InMessageEvent;

export interface Time {
  time?: number;
  dnf?: boolean;
  won: boolean;
}
