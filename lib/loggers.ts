/** @format */

import {
  nodeMailerPatcher,
  redisPatcher,
  ioRedisPatcher,
  nodeCachePatcher,
  nodeSchedulePatcher,
  lruCachePatcher,
  bunyanPatcher,
  winstonPatcher,
  pinoPatcher,
  pusherPatcher,
  knexPatcher,
  axiosPatcher,
  bullPatcher,
  agendaPatcher,
  fetchPatch,
  httpPatcher,
  httpsPatcher,
  sendGridPatcher,
  uncaughtPatcher,
  unhandledRejectionPatcher,
} from "./patchers";
import {
  Errors,
  Mailer,
  Logger,
  Cache,
  Jobs,
  Http,
  Notifications,
  Scheduler,
} from "../types";
import { isPackageInstalled } from "./utils";

/**
 * Monkey patch for exceptions to record errors
 * @param loggerInstance
 * @param errors
 */
export function exceptionMonkeyPatch(loggerInstance: any, errors: Errors[]) {
  for (const error of errors) {
    switch (error) {
      case "uncaught":
        uncaughtPatcher(loggerInstance);
        break;
      case "unhandled":
        unhandledRejectionPatcher(loggerInstance);
      default:
        break;
    }
  }
}

/**
 * Monkey patch for mailer to record emails
 * @param loggerInstance
 * @param mailer
 * @returns @void
 */
export function mailerMonkeyPatch(loggerInstance: any, mailer: Mailer[]) {
  for (const mail of mailer) {
    if (!isPackageInstalled(mail)) {
      throw new Error(`Package ${mail} is not installed`);
    }

    const pkg = require(mail);

    switch (mail) {
      case "nodemailer":
        nodeMailerPatcher(pkg, loggerInstance);
        break;
      case "sendgrid":
        sendGridPatcher(pkg, loggerInstance);
      default:
        break;
    }
  }
}

/**
 * Monkey patch for cache to record cache operations
 * @param loggerInstance
 * @param cache
 * @returns @void
 */
export function cachePatch(
  loggerInstance: any,
  cache: Cache[],
  connection: any
) {
  for (const el of cache) {
    if (!isPackageInstalled(el)) {
      throw new Error(`Package ${el} is not installed`);
    }

    const pkg = require(el);

    switch (el) {
      case "redis":
        redisPatcher(loggerInstance, pkg, connection);
        break;
      case "ioredis":
        ioRedisPatcher(loggerInstance, pkg, connection);
        break;
      case "node-cache":
        nodeCachePatcher(loggerInstance, pkg, connection);
        break;
      case "lru-cache":
        lruCachePatcher(loggerInstance, pkg, connection);
        break;
      default:
        break;
    }
  }
}

/**
 * Monkey patch for logging to record logs inserts
 * @param loggerInstance
 * @param logging
 * @returns @void
 */
export function loggersPatch(
  loggerInstance: any,
  logging: Logger[],
  connection: any
) {
  for (const log of logging) {
    if (!isPackageInstalled(log)) {
      throw new Error(`Package ${log} is not installed`);
    }

    const pkg = require(log);

    switch (log) {
      case "bunyan":
        bunyanPatcher(loggerInstance, pkg, connection);
        break;
      case "winston":
        winstonPatcher(loggerInstance, pkg, connection);
        break;
      case "pino":
        pinoPatcher(loggerInstance, pkg, connection);
        break;
      default:
        break;
    }
  }
}

/**
 * Monkey patch for jobs to record job operations
 * @param loggerInstance
 * @param jobs
 * @returns @void
 */
export function jobsMonkeyPatch(
  loggerInstance: any,
  jobs: Jobs[],
  connection: any
) {
  for (const job of jobs) {
    if (!isPackageInstalled(job)) {
      throw new Error(`Package ${job} is not installed`);
    }

    const pkg = require(job);

    switch (job) {
      case "bull":
        bullPatcher(loggerInstance, pkg, connection);
        break;
      case "agenda":
        agendaPatcher(loggerInstance, pkg, connection);
        break;
      default:
        break;
    }
  }
}

/**
 * Monkey patch for notifications to record notifications
 * @param loggerInstance
 * @param notifications
 * @returns @void
 */
export function notificationPatch(
  loggerInstance: any,
  notifications: Notifications[],
  connection: any
) {
  for (const notification of notifications) {
    if (!isPackageInstalled(notification)) {
      throw new Error(`Package ${notification} is not installed`);
    }

    const pkg = require(notification);

    switch (notification) {
      case "pusher":
        pusherPatcher(loggerInstance, pkg, connection);
        break;
      default:
        break;
    }
  }
}

/**
 *  Monkey patch for scheduler to record scheduled tasks
 * @param loggerInstance
 * @param scheduler
 * @returns @void
 */
export function schedulePatch(
  loggerInstance: any,
  scheduler: Scheduler[],
  connection: any
) {
  for (const schedule of scheduler) {
    if (!isPackageInstalled(schedule)) {
      throw new Error(`Package ${schedule} is not installed`);
    }

    const pkg = require(schedule);

    switch (schedule) {
      case "node-schedule":
        nodeSchedulePatcher(loggerInstance, pkg, connection);
        break;
      default:
        break;
    }
  }
}

/**
 * Monkey patch for requests to record requests
 * @param loggerInstance
 * @param database
 * @returns @void
 */
export function databasePatch(loggerInstance: any, database: any) {
  for (const db of database) {
    if (!isPackageInstalled(db)) {
      throw new Error(`Package ${db} is not installed`);
    }

    const pkg = require(db);

    switch (db) {
      case "knex":
        knexPatcher(loggerInstance, pkg, db.connection);
        break;
      default:
        break;
    }
  }
}

/**
 * Monkey patch for http to record http requests
 * @param loggerInstance
 * @param http
 * @returns @void
 */
export function httpPatch(loggerInstance: any, http: Http[]) {
  for (const h of http) {
    if (!isPackageInstalled(h)) {
      throw new Error(`Package ${h} is not installed`);
    }

    const pkg = require(h);

    switch (h) {
      case "axios":
        axiosPatcher(loggerInstance, pkg);
        break;
      case "http":
        httpPatcher(loggerInstance, pkg);
        break;
      case "https":
        httpsPatcher(loggerInstance, pkg);
        break;
      case "fetch":
        fetchPatch(loggerInstance);
        break;
      default:
        break;
    }
  }
}
