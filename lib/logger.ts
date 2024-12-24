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
import {
  cachePatch,
  mailerPatch,
  loggersPatch,
  notificationPatch,
  schedulePatch,
  jobsPatch,
  databasePatch,
  exceptionPatch,
  frameworkPatch,
  httpPatch,
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
import ExceptionWatcher from "../watchers/ExceptionWatcher";
import {
  Errors,
  Logger,
  Mailer,
  Scheduler,
  StoreConnection,
  StoreDriver,
  Cache,
  Notifications,
  Jobs,
  Config,
  Http,
  Requests,
} from "../types";

export const instanceCreator = (
  driver: StoreDriver,
  connection: StoreConnection
) => ({
  logWatcherInstance: new LogWatcher(driver, connection),
  mailWatcherInstance: new MailWatcher(driver, connection),
  jobWatcherInstance: new JobWatcher(driver, connection),
  scheduleWatcherInstance: new ScheduleWatcher(driver, connection),
  cacheWatcherInstance: new CacheWatcher(driver, connection),
  notificationWatcherInstance: new NotificationWatcher(driver, connection),
  requestWatcherInstance: new RequestWatcher(driver, connection),
  httpClientWatcherInstance: new HTTPClientWatcher(driver, connection),
  queryWatcherInstance: new QueryWatcher(driver, connection),
  exceptionWatcherInstance: new ExceptionWatcher(driver, connection),
});

export const watchers: any = {};

/**
 * Initial entry point for setting up the logger
 * @param config
 * @param driver
 * @param connection
 * @returns @string
 */
export async function setupLogger(
  config: Config,
  driver: StoreDriver,
  connection: StoreConnection
): Promise<string> {
  await setupMigrations(driver, connection);
  const {
    queryWatcherInstance,
    logWatcherInstance,
    mailWatcherInstance,
    jobWatcherInstance,
    notificationWatcherInstance,
    scheduleWatcherInstance,
    cacheWatcherInstance,
    requestWatcherInstance,
    httpClientWatcherInstance,
    exceptionWatcherInstance,
  } = instanceCreator(driver, connection);

  watchers.errors = exceptionWatcherInstance;
  watchers.requests = requestWatcherInstance;
  watchers.http = httpClientWatcherInstance;
  watchers.jobs = jobWatcherInstance;
  watchers.logging = logWatcherInstance;
  watchers.scheduler = scheduleWatcherInstance;
  watchers.mailer = mailWatcherInstance;
  watchers.cache = cacheWatcherInstance;
  watchers.notifications = notificationWatcherInstance;
  watchers.query = queryWatcherInstance;

  for (const [key, value] of Object.entries(config.packages)) {
    switch (key) {
      case "errors":
        initFunctions[key](exceptionWatcherInstance, value as Errors[]);
        break;
      case "requests":
        initFunctions[key](queryWatcherInstance, value as Requests);
        break;
      case "http":
        initFunctions[key](queryWatcherInstance, value as Http[]);
        break;
      case "jobs":
        initFunctions[key](
          jobWatcherInstance,
          value as { name: Jobs; connection: any }[]
        );
        break;
      case "logging":
        initFunctions[key](
          logWatcherInstance,
          value as { name: Logger; connection: any }[]
        );
        break;
      case "scheduler":
        initFunctions[key](
          scheduleWatcherInstance,
          value as { name: Scheduler; connection: any }[]
        );
        break;
      case "mailer":
        initFunctions[key](mailWatcherInstance, value as { name: Mailer }[]);
        watchers.mailer = mailWatcherInstance;
        break;
      case "cache":
        initFunctions[key](
          cacheWatcherInstance,
          value as { name: Cache; connection: any }[]
        );
        break;
      case "notifications":
        initFunctions[key](
          notificationWatcherInstance,
          value as { name: Notifications; connection: any }[]
        );
        break;
      default:
        break;
    }
  }
  console.log("Observatory is ready to use!");
  return "Observatory is ready to use!";
}

/**
 * Setup the migrations depending on the database/storage driver.
 * @param driver
 * @param connection
 */
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

/**
 * Initial functions to setup the logger based on the configuration
 */
const initFunctions = {
  errors: exceptionPatch,
  logging: loggersPatch,
  database: databasePatch,
  jobs: jobsPatch,
  scheduler: schedulePatch,
  mailer: mailerPatch,
  cache: cachePatch,
  notifications: notificationPatch,
  requests: frameworkPatch,
  http: httpPatch,
};

export default setupLogger;
