import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { compare, hash } from 'bcrypt';
import { randomBytes } from 'crypto';
import express, { Request, Response } from 'express';
import { readFileSync } from 'fs';
import multer from 'multer';
import { v4 as uuid } from 'uuid';

import { userIsAuth, verifyAccessToken } from '../auth';
import dataSource from '../data-source';
import { makeSafe, removePassword, User } from '../entity/User';
import { confirmEmail } from '../mailer';

const router = express.Router();
const userRepository = dataSource.getRepository(User);
const upload = multer({ dest: '/tmp' });

// POST /users
// Create user
router.post('/', async (req: Request, res: Response) => {
  const { username, email, pass1, pass2 } = req.body;

  // Make sure every field has data
  if (!username || !email || !pass1 || !pass2) {
    res.status(400).json({ ok: false, reason: 'Please fill out all fields' });
    return;
  }

  // Constrain username
  if (!username.match(/^[a-zA-Z0-9\_]*$/) || username.length > 20) {
    res.status(400).json({
      ok: false,
      reason:
        'Please create a username with 20 or less characters with only letters, numbers, and underscores'
    });
    return;
  }

  // Query existing user
  const userCheck = await userRepository
    .createQueryBuilder()
    .where('"username" = :username', { username })
    .orWhere('"email" = :email', { email })
    .getOne();

  // Tell client user already exists
  if (!!userCheck) {
    res.status(400).json({ ok: false, reason: 'User already exists' });
    return;
  }

  // Check passwords are the same
  if (pass1 !== pass2) {
    res.status(400).json({ ok: false, reason: 'Passwords need to match' });
    return;
  }

  // Hash password
  const password = await hash(pass1, 5);

  // Create UUID for email confirmation
  const confirm = uuid();

  // Create user in the database
  const createdUser = userRepository.create({
    username,
    email,
    password,
    confirm
  });
  await userRepository.save(createdUser);

  // Send confirmation email (don't wait)
  confirmEmail(email, confirm)
    .then(() => {
      console.log('Successfully sent email');
    })
    .catch(err => {
      console.error(err);
    });

  // Return user ID on success
  res.json({ ok: true, id: createdUser.id });
});

// POST /users/verify
// Confirm an account from email
router.post('/verify', async (req: Request, res: Response) => {
  // Get confirmation ID
  const { confirm } = req.body;
  console.log(`confirm: ${confirm}`);
  if (!confirm) {
    return res
      .status(400)
      .json({ ok: false, reason: 'Please include a confirmation ID' });
  }

  // Find corresponding user
  const user = await userRepository.findOneBy({ confirm });
  if (!user) {
    return res
      .status(400)
      .json({ ok: false, reason: 'Invalid confirmation ID' });
  }

  // Save user as confirmed
  user.confirm = null;
  await userRepository.save(user);

  return res.json({
    ok: true,
    user: removePassword(user)
  });
});

// GET /users/@{username}
// Get a user by their username
router.get('/:username', async (req: Request, res: Response) => {
  // Get user from database
  const user = await userRepository.findOneBy({
    username: req.params.username
  });

  // Check that user exists
  if (!user) {
    res.status(404).json({ ok: false, reason: 'User does not exist' });
    return;
  }

  // Return public information
  res.json({ ok: true, user: makeSafe(user) });
});

// PUT /users/{id}
// Update a user by their ID
router.put(
  '/:id',
  userIsAuth,
  upload.single('image'),
  async (req: Request, res: Response) => {
    const { password, bio } = req.body;

    // Check user exists
    const user = await userRepository.findOneBy({ id: req.params.id });
    if (!user) {
      return res
        .status(403)
        .json({ ok: false, reason: 'Not logged in as this user' });
    }

    // Check we are the user we requested
    const payload = await verifyAccessToken(req.headers['authorization']);
    if (!payload || payload['user']['id'] !== user.id) {
      return res
        .status(403)
        .json({ ok: false, reason: 'Not logged in as this user' });
    }

    // Password
    if (!!password) {
      const sameOld = await compare(password.current, user.password);
      if (!sameOld) {
        return res
          .status(401)
          .json({ ok: false, reason: 'Incorrect password' });
      }

      if (password.new1 !== password.new2) {
        return res
          .status(400)
          .json({ ok: false, reason: 'New passwords do not match' });
      }

      user.password = await hash(password.new1, 5);
    }

    // Bio
    if (!!bio) {
      user.bio = bio;
    }

    if (req.file) {
      // Connect to S3
      const client = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY,
          secretAccessKey: process.env.AWS_SECRET_KEY
        }
      });

      // Upload config
      const uploadPath = randomBytes(32).toString('hex') + '.jpg';
      const putObjectCommand = new PutObjectCommand({
        Bucket: 'cubewithme',
        Key: `images/${uploadPath}`,
        Body: readFileSync(req.file.path)
      });

      // Upload file
      try {
        await client.send(putObjectCommand);
        user.pfp = uploadPath;
      } catch (err) {
        return res.status(500).json({ ok: false, reason: err });
      }
    }

    // Save and return
    await userRepository.save(user);
    res.json({ ok: true, user: makeSafe(user) });
  }
);

module.exports = router;
