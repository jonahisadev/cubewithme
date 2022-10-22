import { sign, verify } from 'jsonwebtoken';
import { readFileSync } from 'fs';
import { removePassword, User } from './entity/User';
import dataSource from './data-source';
import { Request, Response, NextFunction } from 'express';

const accessKey = readFileSync('./keys/access.key');
const refreshKey = readFileSync('./keys/refresh.key');

const userRepository = dataSource.getRepository(User);

export const createAccessToken = async (user: User) => {
  // Create access token
  const accessToken = sign(
    {
      user: removePassword(user) as any,
      version: user.token_v + 1,
      exp: Math.floor(Date.now() / 1000) + 15 * 60
    },
    accessKey
  );

  // Increment token version
  user.token_v++;
  await userRepository.save(user);

  // Done!
  return accessToken;
};

export const createTokens = async (user: User) => {
  const accessToken = await createAccessToken(user);

  const refreshToken = sign(
    {
      payload: {
        user_id: user.id,
        noise: Math.floor(Date.now() * Math.random())
      },
      exp: Math.floor(Date.now() / 1000) + 3600 * 24 * 30
    },
    refreshKey
  );

  return {
    accessToken,
    refreshToken
  };
};

export const verifyAccessToken = async (header: string) => {
  if (!header) {
    return false;
  }

  const token = header.split(' ')[1];

  try {
    const payload = verify(token, accessKey) as object;
    const user = await userRepository.findOneBy({ id: payload['user']['id'] });
    if (user.token_v === payload['version']) {
      return payload;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
};

export const verifyRefreshToken = async (token: string) => {
  try {
    return verify(token, refreshKey);
  } catch (err) {
    return false;
  }
};

// Express middleware to verify that a user has a valid session
export const userIsAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1];

  try {
    verify(token, accessKey);
  } catch (err) {
    res.status(401).json({
      ok: false,
      reason: 'Invalid access token'
    });
    return;
  }

  next();
};
