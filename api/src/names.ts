import { readFileSync } from 'fs';
import { join } from 'path';

const config = JSON.parse(
  readFileSync(join(__dirname, '..', 'assets', 'names.json')).toString('ascii')
);

export const generateAnon = (): string => {
  const aLen = config['adjectives'].length;
  const nLen = config['nouns'].length;

  const aIdx = Math.floor(Math.random() * (aLen - 1));
  const nIdx = Math.floor(Math.random() * (nLen - 1));

  return `${config['adjectives'][aIdx]}_${config['nouns'][nIdx]}`;
};
