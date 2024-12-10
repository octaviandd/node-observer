/** @format */

import setupLogger from "./lib/logger";
import { runMigration, rollbackMigration } from "./database/migrate";
import { config } from "./types";
import { RedisClientType } from "redis";
import { MongoClient } from "mongodb";
import { Connection } from "mysql2/promise";
import { Client } from "pg";

export async function startObservatory(config: config, databaseConnection: MongoClient | Client | RedisClientType | Connection, callback: Function) {
  // runMigration();
  await setupLogger(config, databaseConnection);
  console.log("Observatory started with config:", config);
  callback()
}


export default {startObservatory, rollbackMigration, runMigration};
