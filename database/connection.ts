/** @format */

import { Client } from "pg";
import dotenv from "dotenv";
import { createClient } from "redis";
import { MongoClient } from "mongodb";
import * as mysql2 from "mysql2/promise";
import * as mysql from "mysql";

dotenv.config();

export function mysqlConnection() {
  try {
    let connection = mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: parseInt(process.env.MYSQL_PORT || "3306", 10),
    });

    connection.connect();
    return connection;
  } catch (error) {
    console.error(error);
  }
}

export async function mysql2Connection() {
  try {
    let connection = await mysql2.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: parseInt(process.env.MYSQL_PORT || "3306", 10),
    });

    return connection;
  } catch (error) {
    console.error(error);
  }
}

export async function pgConnection() {
  try {
    let connection = new Client({
      host: process.env.PG_HOST,
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
      port: parseInt(process.env.PG_PORT || "5432", 10),
    });

    await connection.connect();
    return connection;
  } catch (error) {
    console.error(error);
  }
}

export function redisConnection() {
  try {
    let connection = createClient({
      url: `redis://${process.env.REDIS_HOST}:${
        process.env.REDIS_PORT || "6379"
      }`,
    });

    return connection;
  } catch (error) {
    console.error(error);
  }
}

export async function mongoConnection() {
  try {
    let connection = new MongoClient(
      `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT || "27017"}`
    );

    await connection.connect();
    return connection;
  } catch (error) {
    console.error(error);
  }
}
