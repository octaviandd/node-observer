/** @format */

declare global {
  namespace Express {
    interface Request {
      session?: {
        id: string;
        [key: string]: any;
      };
    }
  }
}

import { Request, Response, NextFunction } from "express";
import EventsWatcher from "../watchers/EventWatcher";
import RequestWatcher from "../watchers/RequestWatcher";
import JobWatcher from "../watchers/JobWatcher";
import ExceptionWatcher from "../watchers/ExceptionWatcher";
import NotificationWatcher from "../watchers/NotificationWatcher";
import QueryWatcher from "../watchers/QueryWatcher";
import MailWatcher from "../watchers/MailWatcher";
import RedisWatcher from "../watchers/RedisWatcher";
import CacheWatcher from "../watchers/CacheWatcher";
import CommandWatcher from "../watchers/CommandWatcher";
import ScheduleWatcher from "../watchers/ScheduleWatcher";

import { JobCallback } from "node-schedule";

const eventLogger = Object.create(EventsWatcher);
const requestLogger = Object.create(RequestWatcher);
const jobLogger = Object.create(JobWatcher);
const scheduleLogger = Object.create(ScheduleWatcher);
const exceptionLogger = Object.create(ExceptionWatcher);
const notificationLogger = Object.create(NotificationWatcher);
const mailLogger = Object.create(MailWatcher);
const redisLogger = Object.create(RedisWatcher);
const cacheLogger = Object.create(CacheWatcher);
const commandLogger = Object.create(CommandWatcher);
const queryLogger = Object.create(QueryWatcher);

type LoggerType =
  | "event"
  | "job"
  | "exception"
  | "notification"
  | "query"
  | "mail"
  | "cache"
  | "redis"
  | "request";

type MiddleWareParams<T extends LoggerType> = T extends "request"
  ? { req: Request; res: Response; next: NextFunction }
  : T extends "event"
  ? { eventName: string; props: {} }
  : T extends "mail"
  ? { to: string; from: string; subject: string; text: string }
  : T extends "redis"
  ? { key: string; value: string }
  : T extends "query"
  ? { query: string }
  : T extends "exception"
  ? { error: Error }
  : T extends "notification"
  ? { message: string }
  : T extends "job"
  ? { job: string }
  : T extends "cache"
  ? { key: string; value: string }
  : never;

async function withObserver<T extends LoggerType>(
  type: T,
  params: MiddleWareParams<T>,
  callback: any
) {
  let time = new Date();

  switch (type) {
    case "request":
      const { req, res, next } = params as MiddleWareParams<"request">;
      const start = Date.now();

      res.on("finish", () => {
        const duration = Date.now() - start;

        requestLogger.addContent({
          method: req.method,
          url: req.url,
          timestamp: new Date(),
          status: res.statusCode,
          duration,
          ipAddress: req.ip,
          memoryUsage: process.memoryUsage(),
          middleware: req.route ? req.route.path : "unknown",
          controllerAction: req.route ? req.route.stack[0].name : "unknown",
          hostname: req.hostname,
          payload: req.body,
          session: req.session ? req.session.id : "none",
          response: res.locals || "none",
          headers: req.headers,
          body: req.body,
        });
      });
      next();
      break;
    case "event":
      let { eventName, props } = params as MiddleWareParams<"event">;
      eventLogger.addContent({ eventName, props, time });
      callback();
      break;
    case "job":
      let { job } = params as MiddleWareParams<"job">;
      jobLogger.addContent({ job, time });
      callback();
      break;
    case "exception":
      let { error } = params as MiddleWareParams<"exception">;
      exceptionLogger.addContent({ error, time });
      callback();
      break;
    case "notification":
      let { message } = params as MiddleWareParams<"notification">;
      notificationLogger.addContent({ message, time });
      callback();
      break;
    case "query":
      let { query } = params as MiddleWareParams<"query">;
      QueryWatcher.addContent({ query, time });
      callback();
      break;
    case "mail":
      let { to, from, subject, text } = params as MiddleWareParams<"mail">;
      mailLogger.addContent({ to, from, subject, text, time });
      callback();
      break;
    case "redis":
      let { key, value } = params as MiddleWareParams<"redis">;
      redisLogger.addContent({ key, value, time });
      callback();
      break;
    default:
      console.log("No type specified");
  }
}

function isPackageInstalled(npmPackage: string) {
  try {
    require.resolve(npmPackage);
    return true;
  } catch (e) {
    return false;
  }
}

interface GlobalCollectorOptions {
  log?: boolean;
}

function globalCollector(
  packageName: string,
  options: GlobalCollectorOptions = {},
  callback: any
) {
  if (!isPackageInstalled(packageName)) {
    throw new Error(`Package ${packageName} is not installed`);
  }

  const pkg = require(packageName);
  const { log } = options;

  if (packageName === "pusher") {
    const originalTrigger = pkg.prototype.trigger;
    try {
      pkg.prototype.trigger = function (...args: any) {
        console.log(args);
        notificationLogger.addContent({
          channel: args[0],
          name: args[1],
          data: args[2],
          time: new Date(),
        });
        return originalTrigger.apply(this, args);
      };
    } catch (e) {
      console.log(e);
    }
  } else if (packageName === "nodemailer") {
    const originalTrigger = pkg.createTransport;

    try {
      pkg.createTransport = function (...args: any) {
        const transporterInstance = originalTrigger.apply(this, args);
        const originalSendMail = transporterInstance.sendMail;

        transporterInstance.sendMail = function (
          mailOptions: any,
          callback: any
        ) {
          mailLogger.addContent({
            to: mailOptions.to,
            from: mailOptions.from,
            subject: mailOptions.subject,
            text: mailOptions.text,
            html: mailOptions.html,
            time: new Date(),
          });

          return originalSendMail.call(this, mailOptions, callback);
        };

        return transporterInstance;
      };
    } catch (e) {
      console.log(e);
    }
  } else if (packageName === "express") {
    const originalUse = pkg.application.use;

    try {
      pkg.application.use = function (...args: any) {
        const middleware = args[0];
        if (typeof middleware === "function") {
          const originalMiddleware = middleware;

          args[0] = function (req: Request, res: Response, next: NextFunction) {
            const start = Date.now();

            res.on("finish", () => {
              const duration = Date.now() - start;

              if (!req.baseUrl.includes("observatory-api")) {
                requestLogger.addContent({
                  method: req.method,
                  url: req.url,
                  timestamp: new Date(),
                  status: res.statusCode,
                  duration,
                  ipAddress: req.ip,
                  memoryUsage: process.memoryUsage(),
                  middleware: req.route ? req.route.path : "unknown",
                  controllerAction: req.route
                    ? req.route.stack[0].name
                    : "unknown",
                  hostname: req.hostname,
                  payload: req.body,
                  session: req.session ? req.session.id : "none",
                  response: res.locals || "none",
                  headers: req.headers,
                  body: req.body,
                });
              }
            });

            return originalMiddleware(req, res, next);
          };
        }

        return originalUse.apply(this, args);
      };
    } catch (e) {
      console.log(e);
    }
  } else if (packageName === "node-schedule") {
    const originalScheduleJob = pkg.scheduleJob;

    try {
      pkg.scheduleJob = function (...args: any) {
        let funcIndex = args.findIndex((arg: any) => arg instanceof Function);
        const schedule = args[funcIndex];

        scheduleLogger.addContent({
          name: args.length > 2 ? args[0] : "",
          info: args.length > 2 ? args[1] : args[0],
          time: new Date(),
          mode: "set",
        });

        args[funcIndex] = function (...innerArgs: any) {
          scheduleLogger.addContent({
            name: args.length > 2 ? args[0] : "",
            info: args.length > 2 ? args[1] : args[0],
            time: new Date(),
            mode: "run",
          });
          return schedule.apply(this, innerArgs);
        };

        return originalScheduleJob.apply(this, args);
      };
    } catch (e) {
      console.log(e);
    }

    let originalCancelJob = pkg.cancelJob;
    try {
      pkg.cancelJob = function (...args: any) {
        scheduleLogger.addContent({
          name: args.length > 2 ? args[0] : "",
          info: args.length > 2 ? args[1] : args[0],
          time: new Date(),
          mode: "cancel",
        });

        return originalCancelJob.apply(this, args);
      };
    } catch (e) {
      console.error(e);
    }

    let originalRescheduleJob = pkg.rescheduleJob;
    try {
      pkg.rescheduleJob = function (...args: any) {
        scheduleLogger.addContent({
          name: args.length > 2 ? args[0] : "",
          info: args.length > 2 ? args[1] : args[0],
          time: new Date(),
          mode: "reschedule",
        });

        return originalRescheduleJob.apply(this, args);
      };
    } catch (e) {
      console.error(e);
    }
  } else if (packageName === "node-cache") {
    const originalSet = pkg.prototype.set;
    const originalGet = pkg.prototype.get;

    try {
      pkg.prototype.set = function (...args: any) {
        cacheLogger.addContent({
          key: args[0],
          value: args[1],
          time: new Date(),
          type: "set",
        });

        return originalSet.apply(this, args);
      };

      pkg.prototype.get = function (...args: any) {
        cacheLogger.addContent({
          key: args[0],
          value: args[1],
          time: new Date(),
          type: "get",
        });

        return originalGet.apply(this, args);
      };
    } catch (e) {
      console.error(e);
    }
  } else if (packageName === "ioredis") {
    const originalSet = pkg.prototype.set;
    const originalGet = pkg.prototype.get;

    pkg.prototype.set = function (...args: any) {
      redisLogger.addContent({
        key: args[0],
        value: args[1],
        time: new Date(),
        type: "set",
        host: this.options.host,
        db: this.options.db,
        family: this.options.family,
        port: this.options.port,
      });

      return originalSet.apply(this, args);
    };

    pkg.prototype.get = function (...args: any) {
      redisLogger.addContent({
        key: args[0],
        time: new Date(),
        type: "get",
        host: this.options.host,
        db: this.options.db,
        family: this.options.family,
        port: this.options.port,
      });

      return originalGet.apply(this, args);
    };
  }

  if (typeof callback === "function") {
    callback();
  }
}

export { withObserver, globalCollector };
