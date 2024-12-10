/** @format */

import { up as redisUp } from "../database/migrations/redis_observatory";
import { up as mysqlUp } from "../database/migrations/mysql_observatory";
import { up as postgresUp } from "../database/migrations/postgresql_observatory";
import { up as mongodbUp } from "../database/migrations/mongo_observatory";
import { MongoClient } from "mongodb";
import { Client } from "pg";
import { RedisClientType } from "redis";
import { Connection } from "mysql2/promise";
import { collector } from "../middleware/inbuilt/collector";
import LogWatcher from "../watchers/LogWatcher";
import MailWatcher from "../watchers/MailWatcher";

async function setupLogger(
  config: any,
  databaseConnection: MongoClient | Client | RedisClientType | Connection
): Promise<string> {
  // decide what database is used to make the migrations
  // decide whether redis is used or mongodb or any other database

  const databaseType = config.database;
  if (databaseType === "redis") {
    await redisUp(databaseConnection as RedisClientType);
  } else if (databaseType === "mongodb") {
    await mongodbUp(databaseConnection as MongoClient);
  } else if (databaseType === "postgres") {
    await postgresUp(databaseConnection as Client);
  } else if (databaseType === "mysql") {
    await mysqlUp(databaseConnection as Connection);
  }

  const errors = config.packages.errors;
  const logging = config.packages.logging;
  const database = config.packages.database;
  const jobs = config.packages.jobs;
  const scheduler = config.packages.scheduler;
  const mailer = config.packages.mailer;
  const cache = config.packages.cache;
  const notifications = config.packages.notifications;
  const requests = config.packages.requests;
  const http = config.packages.http;

  errors.length > 0 && initErrors(errors);
  logging.length > 0 && initLogging(logging);
  database.length > 0 && initDatabase(database);
  jobs.length > 0 && initJobs(jobs);
  scheduler.length > 0 && initScheduler(scheduler);
  mailer.length > 0 && initMailer(mailer);
  cache.length > 0 && initCache(cache);
  notifications.length > 0 && initNotifications(notifications);
  requests.length > 0 && initRequests(requests);
  http.length > 0 && initHttp(http);

  return "Observatory is ready to use!";
}

function initErrors(errors: string[]) {
  const loggerInstance = new LogWatcher();
  collector.exceptionMonkeyPatch(loggerInstance, errors);
}

function initLogging(logging: string[]) {
  return logging;
}

function initDatabase(database: string[]) {
  return database;
}

function initJobs(jobs: string[]) {
  return jobs;
}

function initScheduler(scheduler: string[]) {
  return scheduler;
}

function initMailer(mailer: string[]) {
  return mailer;
}

function initCache(cache: string[]) {
  return cache;
}

function initNotifications(notifications: string[]) {
  return notifications;
}

function initRequests(requests: string[]) {
  return requests;
}

function initHttp(http: string[]) {
  return http;
}

export default setupLogger;
