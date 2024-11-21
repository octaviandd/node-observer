import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  client: 'mysql',
  connection: {
    host: 'localhost',
    user: "root",
    database: 'observatory',
    port: 3306,
  },
  migrations: {
    directory: './migrations',
    tableName: 'migrations',
  },
  useNullAsDefault: true,
};

const connection = knex(config);

export default connection;