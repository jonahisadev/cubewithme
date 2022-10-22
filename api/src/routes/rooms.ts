import express, { Request, Response } from 'express';
import { Room, safeRoom } from '../entity/Room';
import dataSource from '../data-source';
import { userIsAuth, verifyAccessToken } from '../auth';
import { generateRoomId } from '../gen';
import axios from 'axios';
import { generateAnon } from '../names';

const router = express.Router();
const roomRepository = dataSource.getRepository(Room);

// POST /rooms
// Create a room
router.post('/', userIsAuth, async (req: Request, res: Response) => {
  // Deconstruct request body
  let { title, is_public, password } = req.body;
  console.log(req.body);
  if (!title) {
    title = 'My Room';
  }

  try {
    // Spin up a websocket server
    const { data } = await axios.post(
      `${process.env.WS_API_URL}/ws`,
      {
        title
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    // Process some info
    const short_id = generateRoomId();
    const host =
      process.env.NODE_ENV === 'production'
        ? new URL(process.env.WS_API_URL).hostname
        : 'localhost';
    const protocol = process.env.NODE_ENV === 'production' ? 'wss' : 'ws';
    const url = `${protocol}://${host}:${data.port}`;

    // Save information in the DB
    const createdRoom = roomRepository.create({
      short_id,
      their_id: data.id,
      title,
      is_public,
      password,
      url
    });
    await roomRepository.save(createdRoom);

    res.json({
      ok: true,
      rel: `/rooms/${short_id}`
    });
  } catch (err) {
    console.error(err.message);
    res.status(400).json({
      ok: false,
      reason: err.message
    });
  }
});

// GET /rooms
// Get all rooms
router.get('/', async (_req: Request, res: Response) => {
  const rooms = await roomRepository.findBy({ is_public: true });

  res.json({
    ok: true,
    rooms: rooms.map(room => safeRoom(room))
  });
});

// GET /rooms/{id}
// Get a specific room by ID
router.get('/:short_id', async (req: Request, res: Response) => {
  const { short_id } = req.params;

  const room = await roomRepository.findOneBy({ short_id });

  res.json({
    ok: true,
    room: safeRoom(room)
  });
});

// POST /rooms/{id}/join
router.post('/:short_id/join', async (req: Request, res: Response) => {
  const { short_id } = req.params;
  const room = await roomRepository.findOneBy({ short_id });

  // No such room
  if (!room) {
    res.status(404).json({
      ok: false,
      reason: 'No such room exists'
    });
    return;
  }

  // Request to spectate
  if (req.body.spectate) {
    return res.json({
      ok: true,
      ws_id: null,
      ws_url: room.url
    });
  }

  // This room is password protected
  if (!room.is_public && room.password) {
    const { pass } = req.body;
    if (!pass || pass !== room.password) {
      res.status(200).json({
        ok: true,
        needs_pass: true
      });
      return;
    }
  }

  // Check if there's a ws_id already
  const ws_id_cookie = req.cookies['_ws_id'] || null;

  // Check if we included authorization
  let username = '';
  const access_token = await verifyAccessToken(req.headers['authorization']);
  if (!!access_token) {
    username = access_token['user']['username'];
  } else {
    username = generateAnon();
  }

  // Register player
  const registerPlayer = await axios.post(
    `${process.env.WS_API_URL}/ws/register`,
    {
      ws_id: ws_id_cookie,
      username
    },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  // Some sort of error
  if (!registerPlayer.data.ok) {
    return res.status(400).json({
      ok: false,
      reason: registerPlayer.data.reason
    });
  }

  // Send back info
  res.json({
    ok: true,
    ws_id: registerPlayer.data.ws_id,
    ws_url: room.url
  });
});

module.exports = router;
