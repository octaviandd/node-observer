import type { Knex } from "knex";

// Update with your config settings.

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'mysql2',
    connection: {
      host: 'localhost',
      user: "root",
      database: 'observatory',
      port: 3306,
    },
    migrations: {
      directory: './database/migrations',
      tableName: 'migrations',
    },
    useNullAsDefault: true,
  },
};

module.exports = config;
