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
  mailerMonkeyPatch,
  loggersPatch,
  notificationPatch,
  schedulePatch,
  jobsMonkeyPatch,
  databasePatch,
  exceptionMonkeyPatch,
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
} from "../types";
import { expressRequestPatcher, httpPatcher } from "./patchers";

export function instanceCreator(
  driver: StoreDriver,
  connection: StoreConnection
) {
  const logWatcherInstance = new LogWatcher(driver, connection);
  const mailWatcherInstance = new MailWatcher(driver, connection);
  const jobWatcherInstance = new JobWatcher(driver, connection);
  const scheduleWatcherInstance = new ScheduleWatcher(driver, connection);
  const cacheWatcherInstance = new CacheWatcher(driver, connection);
  const notificationWatcherInstance = new NotificationWatcher(
    driver,
    connection
  );
  const requestWatcherInstance = new RequestWatcher(driver, connection);
  const httpClientWatcherInstance = new HTTPClientWatcher(driver, connection);
  const queryWatcherInstance = new QueryWatcher(driver, connection);
  const exceptionWatcherInstance = new ExceptionWatcher(driver, connection);

  return {
    logWatcherInstance,
    mailWatcherInstance,
    jobWatcherInstance,
    scheduleWatcherInstance,
    cacheWatcherInstance,
    notificationWatcherInstance,
    requestWatcherInstance,
    httpClientWatcherInstance,
    queryWatcherInstance,
    exceptionWatcherInstance,
  };
}

export const watchers: any = {};

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
  console.log("hit");
  // await setupMigrations(driver, connection);
  console.log("hitjere");

  console.log(config);

  const packages: (keyof typeof initFunctions)[] = [
    "errors",
    "logging",
    "database",
    "jobs",
    "scheduler",
    "mailer",
    "cache",
    "notifications",
    "requests",
    "http",
  ];

  packages.forEach((pkg) => {
    if (config.packages.hasOwnProperty(pkg)) {
      initFunctions[pkg](config.packages[pkg], driver, connection);
    }
  });

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
    const { exceptionWatcherInstance } = instanceCreator(driver, connection);
    exceptionMonkeyPatch(exceptionWatcherInstance, items);
    watchers.errors = exceptionWatcherInstance;
  },
  logging: (
    items: Logger[],
    driver: StoreDriver,
    connection: StoreConnection
  ) => {
    const { logWatcherInstance } = instanceCreator(driver, connection);
    loggersPatch(logWatcherInstance, items, connection);
    watchers.logging = logWatcherInstance;
  },
  database: (
    items: string[],
    driver: StoreDriver,
    connection: StoreConnection
  ) => {
    const { queryWatcherInstance } = instanceCreator(driver, connection);
    databasePatch(queryWatcherInstance, items);
    watchers.database = queryWatcherInstance;
  },
  jobs: (items: Jobs[], driver: StoreDriver, connection: StoreConnection) => {
    const { jobWatcherInstance } = instanceCreator(driver, connection);
    jobsMonkeyPatch(jobWatcherInstance, items, connection);
    watchers.jobs = jobWatcherInstance;
  },
  scheduler: (
    items: Scheduler[],
    driver: StoreDriver,
    connection: StoreConnection
  ) => {
    const { scheduleWatcherInstance } = instanceCreator(driver, connection);
    schedulePatch(scheduleWatcherInstance, items, connection);
    watchers.scheduler = scheduleWatcherInstance;
  },
  mailer: (
    items: Mailer[],
    driver: StoreDriver,
    connection: StoreConnection
  ) => {
    const { mailWatcherInstance } = instanceCreator(driver, connection);
    mailerMonkeyPatch(mailWatcherInstance, items);
    watchers.mailer = mailWatcherInstance;
  },
  cache: (items: Cache[], driver: StoreDriver, connection: StoreConnection) => {
    const { cacheWatcherInstance } = instanceCreator(driver, connection);
    cachePatch(cacheWatcherInstance, items, connection);
    watchers.cache = cacheWatcherInstance;
  },
  notifications: (
    items: Notifications[],
    driver: StoreDriver,
    connection: StoreConnection
  ) => {
    const { notificationWatcherInstance } = instanceCreator(driver, connection);
    notificationPatch(notificationWatcherInstance, items, connection);
    watchers.notifications = notificationWatcherInstance;
  },
  requests: (
    items: string[],
    driver: StoreDriver,
    connection: StoreConnection
  ) => {
    const { requestWatcherInstance } = instanceCreator(driver, connection);
    expressRequestPatcher(requestWatcherInstance, items);
    watchers.requests = requestWatcherInstance;
  },
  http: (items: string[], driver: StoreDriver, connection: StoreConnection) => {
    const { httpClientWatcherInstance } = instanceCreator(driver, connection);
    httpPatcher(httpClientWatcherInstance, items);
    watchers.http = httpClientWatcherInstance;
  },
};

export default setupLogger;
