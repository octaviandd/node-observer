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
  expressPatcher,
  log4jsPatcher,
  nodeCronPatcher,
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
export function exceptionPatch(loggerInstance: any, errors: Errors[]) {
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
export function mailerPatch(loggerInstance: any, mailer: { name: Mailer }[]) {
  for (const mail of mailer) {
    if (!isPackageInstalled(mail.name)) {
      throw new Error(`Package ${mail} is not installed`);
    }

    const pkg = require(mail.name);

    switch (mail.name) {
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
  cache: { name: Cache; connection: any }[]
) {
  for (const el of cache) {
    if (!isPackageInstalled(el.name)) {
      throw new Error(`Package ${el} is not installed`);
    }

    const pkg = require(el.name);

    switch (el.name) {
      case "redis":
        redisPatcher(loggerInstance, pkg, el.connection);
        break;
      case "ioredis":
        ioRedisPatcher(loggerInstance, pkg, el.connection);
        break;
      case "node-cache":
        nodeCachePatcher(loggerInstance, pkg, el.connection);
        break;
      case "lru-cache":
        lruCachePatcher(loggerInstance, pkg, el.connection);
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
  logging: { name: Logger; connection: any }[]
) {
  for (const log of logging) {
    if (!isPackageInstalled(log.name)) {
      throw new Error(`Package ${log.name} is not installed`);
    }

    const pkg = require(log.name);

    switch (log.name) {
      case "bunyan":
        bunyanPatcher(loggerInstance, log.connection);
        break;
      case "winston":
        winstonPatcher(loggerInstance, pkg);
        break;
      case "pino":
        pinoPatcher(loggerInstance, log.connection);
        break;
      case "log4js":
        log4jsPatcher(loggerInstance, pkg, log.connection);
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
export function jobsPatch(
  loggerInstance: any,
  jobs: { name: Jobs; connection: any }[]
) {
  for (const job of jobs) {
    if (!isPackageInstalled(job.name)) {
      throw new Error(`Package ${job.name} is not installed`);
    }

    const pkg = require(job.name);

    switch (job.name) {
      case "bull":
        bullPatcher(loggerInstance, pkg);
        break;
      case "agenda":
        agendaPatcher(loggerInstance, job.connection);
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
  notifications: { name: Notifications; connection: any }[]
) {
  for (const notification of notifications) {
    if (!isPackageInstalled(notification.name)) {
      throw new Error(`Package ${notification.name} is not installed`);
    }

    const pkg = require(notification.name);

    switch (notification.name) {
      case "pusher":
        pusherPatcher(loggerInstance, pkg);
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
  scheduler: { name: Scheduler; connection: any }[]
) {
  for (const schedule of scheduler) {
    if (!isPackageInstalled(schedule.name)) {
      throw new Error(`Package ${schedule.name} is not installed`);
    }

    const pkg = require(schedule.name);

    switch (schedule.name) {
      case "node-schedule":
        nodeSchedulePatcher(loggerInstance, pkg);
        break;
      case "node-cron":
        nodeCronPatcher(loggerInstance, pkg);
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

/**
 *  Monkey patch for framework to record framework operations
 * @param loggerInstance
 * @param framework
 * @returns @void
 */
export function frameworkPatch(loggerInstance: any, framework: string) {
  const pkg = require(framework);

  switch (framework) {
    case "express":
      expressPatcher(loggerInstance, pkg);
      break;
    default:
      break;
  }
}
