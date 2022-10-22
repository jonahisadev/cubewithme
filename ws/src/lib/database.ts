// client is faster than dotenv
import * as dotenv from 'dotenv';
dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env'
});
import pg from 'pg';

const client = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: 'cubes',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT as string)
});
client.connect();

export default client;
