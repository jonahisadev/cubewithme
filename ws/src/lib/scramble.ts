import { randomScrambleForEvent } from 'cubing/scramble';

export type ScrambleEvent =
  | '333'
  | '222'
  | '444'
  | '555'
  | '666'
  | '777'
  | 'clock'
  | 'minx'
  | 'pyram'
  | 'skewb'
  | 'sq1';

export const scramble = async (event: ScrambleEvent) => {
  const scramble = await randomScrambleForEvent(event);
  const str = scramble.toString();
  if (event === 'sq1') {
    return str.replace(/, /g, ',');
  }
  return str;
};
