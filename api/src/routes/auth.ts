import express, { Request, Response } from 'express';
import { User } from '../entity/User';
import dataSource from '../data-source';
import { compare } from 'bcrypt';
import {
  createAccessToken,
  createTokens,
  verifyAccessToken,
  verifyRefreshToken
} from '../auth';

const router = express.Router();
const userRepository = dataSource.getRepository(User);

router.post('/login', async (req: Request, res: Response) => {
  // Make sure we get back data
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({
      ok: false,
      reason: 'Please enter all fields'
    });
    return;
  }

  // Find user
  const user = await userRepository.findOneBy({ username });

  // User does not exist
  if (!user) {
    res.status(400).json({
      ok: false,
      reason: 'Invalid credentials'
    });
    return;
  }

  // Check email is confirmed (null means we are confirmed)
  if (!!user.confirm) {
    return res.status(401).json({
      ok: false,
      reason: 'Please confirm your email'
    });
  }

  // Check that password is correct
  if (!(await compare(password, user.password))) {
    res.status(400).json({
      ok: false,
      reason: 'Invalid credentials'
    });
    return;
  }

  // Generate tokens
  const { accessToken, refreshToken } = await createTokens(user);

  // Set the refresh token in the cookie
  res.cookie('_sid', refreshToken, {
    sameSite: 'none',
    secure: true,
    maxAge: 1000 * 3600 * 24 * 30
  });

  // Send back the access token
  res.json({
    ok: true,
    accessToken
  });
});

router.post('/refresh', async (req: Request, res: Response) => {
  // Get refresh token from cookies
  const token = req.cookies['_sid'];

  // Verify refresh token
  const payload = await verifyRefreshToken(token);
  if (!payload) {
    res.status(400).json({
      ok: false,
      reason: 'Invalid refresh token'
    });
    return;
  }

  // Get user
  const user = await userRepository.findOneBy({
    id: payload['payload']['user_id']
  });

  // Create access token
  const accessToken = await createAccessToken(user);

  res.json({
    ok: true,
    accessToken
  });
});

// TODO: delete this
router.get('/__check', async (req, res) => {
  const payload = await verifyAccessToken(req.headers['authorization']);

  res.json({
    result: payload
  });
});

module.exports = router;
