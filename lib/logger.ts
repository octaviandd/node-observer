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
} from "../types";
import { expressRequestPatcher, httpPatcher } from "./patchers";

/**
 * Initial entry point for setting up the logger
 * @param config
 * @param driver
 * @param connection
 * @returns @string
 */
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

  errors && initFunctions.errors(errors.name, driver, connection);
  logging && initFunctions.logging(logging.name, driver, connection);
  database && initFunctions.database(database.name, driver, connection);
  jobs && initFunctions.jobs(jobs.name, driver, connection);
  scheduler && initFunctions.scheduler(scheduler.name, driver, connection);
  mailer && initFunctions.mailer(mailer.name, driver, connection);
  cache && initFunctions.cache(cache.name, driver, connection);
  notifications &&
    initFunctions.notifications(notifications.name, driver, connection);
  requests && initFunctions.requests(requests.name, driver, connection);
  http && initFunctions.http(http.name, driver, connection);

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
  errors: (
    items: Errors[],
    driver: StoreDriver,
    connection: StoreConnection
  ) => {
    const loggerInstance = new LogWatcher(driver, connection);
    collector.exceptionMonkeyPatch(loggerInstance, items);
  },
  logging: (
    items: Logger[],
    driver: StoreDriver,
    connection: StoreConnection
  ) => {
    const loggerInstance = new LogWatcher(driver, connection);
    loggersPatch(loggerInstance, items, connection);
    return items;
  },
  database: (
    items: string[],
    driver: StoreDriver,
    connection: StoreConnection
  ) => {
    const loggerInstance = new QueryWatcher(driver, connection);
    databasePatch(loggerInstance, items);
    return items;
  },
  jobs: (items: Jobs[], driver: StoreDriver, connection: StoreConnection) => {
    const loggerInstance = new JobWatcher(driver, connection);
    jobsMonkeyPatch(loggerInstance, items, connection);
    return items;
  },
  scheduler: (
    items: Scheduler[],
    driver: StoreDriver,
    connection: StoreConnection
  ) => {
    const loggerInstance = new ScheduleWatcher(driver, connection);
    schedulePatch(loggerInstance, items, connection);
    return items;
  },
  mailer: (
    items: Mailer[],
    driver: StoreDriver,
    connection: StoreConnection
  ) => {
    const loggerInstance = new MailWatcher(driver, connection);
    mailerMonkeyPatch(loggerInstance, items);
    return items;
  },
  cache: (items: Cache[], driver: StoreDriver, connection: StoreConnection) => {
    const loggerInstance = new CacheWatcher(driver, connection);
    cachePatch(loggerInstance, items, connection);
    return items;
  },
  notifications: (
    items: Notifications[],
    driver: StoreDriver,
    connection: StoreConnection
  ) => {
    const loggerInstance = new NotificationWatcher(driver, connection);
    notificationPatch(loggerInstance, items, connection);
    return items;
  },
  requests: (
    items: string[],
    driver: StoreDriver,
    connection: StoreConnection
  ) => {
    const loggerInstance = new RequestWatcher(driver, connection);
    expressRequestPatcher(loggerInstance, items);
    return items;
  },
  http: (items: string[], driver: StoreDriver, connection: StoreConnection) => {
    const loggerInstance = new HTTPClientWatcher(driver, connection);
    httpPatcher(loggerInstance, items);
    return items;
  },
};

export default setupLogger;
