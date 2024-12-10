import knex from 'knex';
import {Client} from 'pg';
import dotenv from 'dotenv';
import {createClient} from 'redis';
import { MongoClient } from 'mongodb';
dotenv.config();

export function knexConnection(){
  return knex({
    client: 'mysql2',
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
  });
}

export async function pgConnection() {
  return await new Client({
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    port: parseInt(process.env.PG_PORT || '5432', 10),
  }).connect();
}

export async function redisConnection() {
  return await createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || '6379'}`,
  });
}

export async function mongoConnection() {
  return await new MongoClient(`mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT || '27017'}`).connect();
}
