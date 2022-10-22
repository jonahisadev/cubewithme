import * as dotenv from 'dotenv';
dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env'
});
import express, { Request, Response } from 'express';
import { notFound } from './routes/notFound';
import dataSource from './data-source';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import cors from 'cors';

console.log(`NODE_ENV=${process.env.NODE_ENV}`);

const app = express();

const corsConfig = {
  origin: process.env.CORS_ORIGIN || '127.0.0.1',
  allowedHeaders: ['Authorization', 'Content-Type', 'Cookie'],
  credentials: true
};

const PORT = process.env.PORT || 8080;

// We need to first initialze the DB
dataSource
  .initialize()
  .then(async () => {
    // Middleware
    app.use(morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev'));
    app.use(express.json());
    app.use(cookieParser());

    // CORS
    app.use(cors(corsConfig));
    app.options('*', cors(corsConfig));

    // Status
    app.get('/', (_req: Request, res: Response) => {
      res.json({ ok: true });
    });

    // API routes
    app.use('/users', require('./routes/users'));
    app.use('/rooms', require('./routes/rooms'));
    app.use('/auth', require('./routes/auth'));

    // Handle 404
    app.use(notFound);

    // Serve
    app.listen(PORT, () => console.log(`🚀 API listening on port ${PORT}`));
  })
  .catch(err => console.log(err));
