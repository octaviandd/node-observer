/** @format */

import { up as redisUp } from "../database/migrations/redis_observatory";
import { up as mysql2Up } from "../database/migrations/mysql2_observatory";
import { up as mysqlUp } from "../database/migrations/mysql_observatory";
import { up as postgresUp } from "../database/migrations/postgresql_observatory";
import { up as mongodbUp } from "../database/migrations/mongo_observatory";
import { MongoClient } from "mongodb";
import { Client } from "pg";
import { RedisClientType } from "redis";
import { Connection as MySql2Connection } from "mysql2/promise";
import { Connection as MySqlConnection } from "mysql";
import { collector } from "../middleware/inbuilt/collector";
import {
  cachePatch,
  mailerMonkeyPatch,
  loggersPatch,
  notificationPatch,
  schedulePatch,
  jobsMonkeyPatch,
  databasePatch,
} from "./loggers";
import LogWatcher from "../watchers/LogWatcher";
import MailWatcher from "../watchers/MailWatcher";
import JobWatcher from "../watchers/JobWatcher";
import ScheduleWatcher from "../watchers/ScheduleWatcher";
import CacheWatcher from "../watchers/CacheWatcher";
import NotificationWatcher from "../watchers/NotificationWatcher";
import RequestWatcher from "../watchers/RequestWatcher";
import HTTPClientWatcher from "../watchers/HTTPClientWatcher";
import QueryWatcher from "../watchers/QueryWatcher";
import { requestPatch } from "./patchers";
import { ConnectionType, ConnectionDriver } from "../types";

export async function setupLogger(
  config: any,
  driver: ConnectionDriver,
  connection: ConnectionType
): Promise<string> {
  await setupMigrations(driver, connection);

  const errors = config.packages.has("errors");
  const logging = config.packages.has("logging");
  const database = config.packages.has("database");
  const jobs = config.packages.has("jobs");
  const scheduler = config.packages.has("scheduler");
  const mailer = config.packages.has("mailer");
  const cache = config.packages.has("cache");
  const notifications = config.packages.has("notifications");
  const requests = config.packages.has("requests");
  const http = config.packages.has("http");

  errors && initErrors(errors.name);
  logging && initLogging(logging.name);
  database && initDatabase(database.name);
  jobs && initJobs(jobs.name);
  scheduler && initScheduler(scheduler.name);
  mailer && initMailer(mailer.name);
  cache && initCache(cache.name);
  notifications && initNotifications(notifications.name);
  requests && initRequests(requests.name);
  http && initHttp(http.name);

  return "Observatory is ready to use!";
}

async function setupMigrations(driver: string, connection: ConnectionType) {
  if (driver === "redis") {
    await redisUp(connection as RedisClientType);
  } else if (driver === "mongodb") {
    await mongodbUp(connection as MongoClient);
  } else if (driver === "postgres") {
    await postgresUp(connection as Client);
  } else if (driver === "mysql") {
    await mysqlUp(connection as MySqlConnection);
  } else if (driver === "mysql2") {
    await mysql2Up(connection as MySql2Connection);
  }
}

function initErrors(errors: string[]) {
  const loggerInstance = new LogWatcher();
  collector.exceptionMonkeyPatch(loggerInstance, errors);
}

function initLogging(logging: string[]) {
  const loggerInstance = new LogWatcher();
  loggersPatch(loggerInstance, logging);
  return logging;
}

function initDatabase(database: string[]) {
  const loggerInstance = new QueryWatcher();
  databasePatch(loggerInstance, database);
  return database;
}

function initJobs(jobs: string[]) {
  const loggerInstance = new JobWatcher();
  jobsMonkeyPatch(loggerInstance, jobs);
  return jobs;
}

function initScheduler(scheduler: string[]) {
  const loggerInstance = new ScheduleWatcher();
  schedulePatch(loggerInstance, scheduler);
  return scheduler;
}

function initMailer(mailer: string[]) {
  const loggerInstance = new MailWatcher();
  mailerMonkeyPatch(loggerInstance, mailer);
  return mailer;
}

function initCache(cache: string[]) {
  const loggerInstance = new CacheWatcher();
  cachePatch(loggerInstance, cache);
  return cache;
}

function initNotifications(notifications: string[]) {
  const loggerInstance = new NotificationWatcher();
  notificationPatch(loggerInstance, notifications);
  return notifications;
}

function initRequests(requests: string[]) {
  const loggerInstance = new RequestWatcher();
  requestPatch(loggerInstance, requests);
  return requests;
}

function initHttp(http: string[]) {
  const loggerInstance = new HTTPClientWatcher();
  return http;
}

export default setupLogger;
