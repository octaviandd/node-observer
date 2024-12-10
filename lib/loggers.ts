import { nodeMailer, redis, ioRedis, nodeCache, nodeSchedule, lruCache, bunyan, winston, pino, pusher, knex } from "./patchers";

/**
 * Fetch monkey patch to record fetch requests
 * @param logger
 * @returns @Response
 */
export function fetchMonkeyPatch(logger: any) {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async function (url, options = {}) {
    const startTime = Date.now();

    const req = new Request(url, options);
    try {
      const response = await originalFetch(url, options);
      const duration = Date.now() - startTime;
      const memoryUsage = process.memoryUsage();

      const responseCopy = response.clone();

      logger.addContent({
        method: req.method,
        url: req.url,
        timestamp: new Date(),
        status: response.status,
        duration,
        memoryUsage,
        payload: req.body || "N/A",
        options,
        headers: Object.fromEntries(response.headers.entries()),
        response: await responseCopy.json(),
      });

      return response;
    } catch (error) {
      console.error(`Fetch failed:`, error);
      throw error;
    }
  };
  return;
}

/**
 * Monkey patch for exceptions to record errors
 * @param loggerInstance
 * @param errors
 */
export function exceptionMonkeyPatch(loggerInstance: any, errors: any) {
  const ERROR_TYPES = ["uncaughtException", "unhandledRejection"];
  ERROR_TYPES.forEach((type) => {
    process.on(type, (error: Error) => {
      loggerInstance.addContent({
        message: error.message,
        stack: error.stack,
        name: error.name,
        time: new Date(),
      });
    });
  });
}

/**
 * Monkey patch for mailer to record emails
 * @param loggerInstance
 * @param mailer
 * @returns @void
 */
export function mailerMonkeyPatch(loggerInstance: any, mailer: any) {
  for (const mail of mailer) {
    if (!isPackageInstalled(mail)) {
      throw new Error(`Package ${mail} is not installed`);
    }

    const pkg = require(mail);

    switch (mail) {
      case "nodemailer":
        nodeMailer(pkg, loggerInstance);
        break;
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
export function cachePatch(loggerInstance: any, cache: any) {
  for (const el of cache.name) {
    if (!isPackageInstalled(el)) {
      throw new Error(`Package ${el} is not installed`);
    }

    const pkg = require(cache);

    switch (cache) {
      case "redis":
        redis(loggerInstance, pkg, cache.connection);
        break;
      case "ioredis":
        ioRedis(loggerInstance, pkg, cache.connection);
        break;
      case "node-cache":
       nodeCache(loggerInstance, pkg, cache.connection);
     case "lru-cache":
      lruCache(loggerInstance, pkg, cache.connection);
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
export function loggersPatch(loggerInstance: any, logging: any) {
  for (const log of logging.name) {
    if (!isPackageInstalled(log)) {
      throw new Error(`Package ${log} is not installed`);
    }

    const pkg = require(log);

    switch (log) {
      case "bunyan":
       bunyan(loggerInstance, pkg, logging.connection);
      break;
      case "winston":
       winston(loggerInstance, pkg, logging.connection);
       break;
      case "pino":
       pino(loggerInstance, pkg, logging.connection);
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
export function jobsMonkeyPatch(loggerInstance: any, jobs: any) {
  for (const job of jobs) {
    if (!isPackageInstalled(job)) {
      throw new Error(`Package ${job} is not installed`);
    }

    const pkg = require(job);

    switch (job) {
      case "node-schedule":
        nodeSchedule(loggerInstance, pkg, job.connection);
        break;
      default:
        break;
    }
  }
}

export function notificationPatch(loggerInstance: any, notifications: any) {
  for (const notification of notifications) {
    if (!isPackageInstalled(notification)) {
      throw new Error(`Package ${notification} is not installed`);
    }

    const pkg = require(notification);

    switch (notification) {
      case "pusher":
        pusher(loggerInstance, pkg, notification.connection);
        break;
      default:
        break;
    }
  }
}

export function schedulePatch(loggerInstance: any, scheduler: any) {
  for (const schedule of scheduler) {
    if (!isPackageInstalled(schedule)) {
      throw new Error(`Package ${schedule} is not installed`);
    }

    const pkg = require(schedule);

    switch (schedule) {
      case "node-schedule":
        nodeSchedule(loggerInstance, pkg, schedule.connection);
        break;
      default:
        break;
    }
  }
}

export function databasePatch(loggerInstance: any, database: any) {
  for (const db of database) {
    if (!isPackageInstalled(db)) {
      throw new Error(`Package ${db} is not installed`);
    }

    const pkg = require(db);

    switch (db) {
      case "knex":
        knex(loggerInstance, pkg, db.connection);
        break;
      default:
        break;
    }
  }
}