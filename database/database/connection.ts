import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const connection = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL,
  useNullAsDefault: true,
});

export default connection;