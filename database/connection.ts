import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  client: 'pg',
  connection: process.env.DATABASE_URL,
  useNullAsDefault: true,
};

const connection = knex(config);

export default connection;