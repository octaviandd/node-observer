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
import {
  Errors,
  Logger,
  Mailer,
  Scheduler,
  StoreConnection,
  StoreDriver,
  Cache,
  Notifications,
} from "../types";

export async function setupLogger(
  config: any,
  driver: StoreDriver,
  connection: StoreConnection
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

  errors && initErrors(errors.name, driver, connection);
  logging && initLogging(logging.name, driver, connection);
  database && initDatabase(database.name, driver, connection);
  jobs && initJobs(jobs.name, driver, connection);
  scheduler && initScheduler(scheduler.name, driver, connection);
  mailer && initMailer(mailer.name, driver, connection);
  cache && initCache(cache.name, driver, connection);
  notifications && initNotifications(notifications.name, driver, connection);
  requests && initRequests(requests.name, driver, connection);
  http && initHttp(http.name, driver, connection);

  return "Observatory is ready to use!";
}

async function setupMigrations(driver: string, connection: StoreConnection) {
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

function initErrors(
  errors: Errors[],
  driver: StoreDriver,
  connection: StoreConnection
) {
  const loggerInstance = new LogWatcher(driver, connection);
  collector.exceptionMonkeyPatch(loggerInstance, errors);
}

function initLogging(
  logging: Logger[],
  driver: StoreDriver,
  connection: StoreConnection
) {
  const loggerInstance = new LogWatcher(driver, connection);
  loggersPatch(loggerInstance, logging, connection);
  return logging;
}

function initDatabase(
  database: string[],
  driver: StoreDriver,
  connection: StoreConnection
) {
  const loggerInstance = new QueryWatcher(driver, connection);
  databasePatch(loggerInstance, database);
  return database;
}

function initJobs(
  jobs: string[],
  driver: StoreDriver,
  connection: StoreConnection
) {
  const loggerInstance = new JobWatcher(driver, connection);
  jobsMonkeyPatch(loggerInstance, jobs);
  return jobs;
}

function initScheduler(
  scheduler: Scheduler[],
  driver: StoreDriver,
  connection: StoreConnection
) {
  const loggerInstance = new ScheduleWatcher(driver, connection);
  schedulePatch(loggerInstance, scheduler);
  return scheduler;
}

function initMailer(
  mailer: Mailer[],
  driver: StoreDriver,
  connection: StoreConnection
) {
  const loggerInstance = new MailWatcher(driver, connection);
  mailerMonkeyPatch(loggerInstance, mailer);
  return mailer;
}

function initCache(
  cache: Cache[],
  driver: StoreDriver,
  connection: StoreConnection
) {
  const loggerInstance = new CacheWatcher(driver, connection);
  cachePatch(loggerInstance, cache, connection);
  return cache;
}

function initNotifications(
  notifications: Notifications[],
  driver: StoreDriver,
  connection: StoreConnection
) {
  const loggerInstance = new NotificationWatcher(driver, connection);
  notificationPatch(loggerInstance, notifications);
  return notifications;
}

function initRequests(
  requests: string[],
  driver: StoreDriver,
  connection: StoreConnection
) {
  const loggerInstance = new RequestWatcher(driver, connection);
  requestPatch(loggerInstance, requests);
  return requests;
}

function initHttp(
  http: string[],
  driver: StoreDriver,
  connection: StoreConnection
) {
  const loggerInstance = new HTTPClientWatcher(driver, connection);
  return http;
}

export default setupLogger;
