import express, { Request, Response } from 'express';
import { createRoom, findPlayerById, registerUser } from '../lib/index.js';

const router = express.Router();

// POST /ws
// Create a new websocket
router.post('/', async (req: Request, res: Response) => {
  const { title } = req.body;

  try {
    const room = await createRoom(title);
    console.log(`Created room on ${room.port}`);
    res.json({
      ok: true,
      id: room.id,
      port: room.port
    });
  } catch (err) {
    res.status(400).json({
      ok: false,
      reason: err
    });
  }
});

// GET /ws/{id}
// Return more specific information about a given server
router.get('/:id', (_req: Request, _res: Response) => {
  // TODO: implement
});

// POST /ws/register
router.post('/register', async (req: Request, res: Response) => {
  const { ws_id, username } = req.body;

  console.log(req.body);

  // We ignore the given username in favor of the existing one
  if (ws_id) {
    const player = await findPlayerById(ws_id);
    if (player) {
      console.log('Player already exists');
      return res.json({
        ok: true,
        ws_id: player.id
      });
    }
  }

  console.log('New player');

  // Create user if there is no id
  try {
    const player = await registerUser(username, null);
    res.json({
      ok: true,
      ws_id: player.id
    });
  } catch (err) {
    res.json({
      ok: false,
      reason: err
    });
  }
});

export default router;
