import * as dotenv from 'dotenv';
dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env'
});
import express, { Request, Response } from 'express';
import ws from './routes/ws.js';

console.log(`NODE_ENV=${process.env.NODE_ENV}`);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json({}));

app.get('/', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

app.use('/ws', ws);

app.listen(PORT, () =>
  console.log(`🖥  WebSocket server is ready on port ${PORT}`)
);
