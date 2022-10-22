import { randomBytes } from 'crypto';

export const generateRoomId = () => {
  return randomBytes(8).toString('base64url');
}
