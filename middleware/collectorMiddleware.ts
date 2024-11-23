/** @format */

import { Client } from "./../node_modules/undici-types/client.d";
/** @format */

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

const eventLogger = Object.create(EventsWatcher);
const requestLogger = Object.create(RequestWatcher);
const jobLogger = Object.create(JobWatcher);
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
          middleware: "middleware",
          controllerAction: "requestLogger",
          hostname: req.hostname,
          payload: req.body,
          session: "session",
          response: "response",
          headers: req.headers,
          body: "body",
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
        notificationLogger.addContent({ message: "test", time: new Date() });
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

              requestLogger.addContent({
                method: req.method,
                url: req.url,
                timestamp: new Date(),
                status: res.statusCode,
                duration,
                ipAddress: req.ip,
                memoryUsage: process.memoryUsage(),
                middleware: "middleware",
                controllerAction: "requestLogger",
                hostname: req.hostname,
                payload: req.body,
                session: "session",
                response: "response",
                headers: req.headers,
                body: "body",
              });
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
        const job = args[1];
        const originalJob = job;

        args[1] = function () {
          jobLogger.addContent({ job: originalJob.name, time: new Date() });
          return originalJob();
        };

        return originalScheduleJob.apply(this, args);
      };
    } catch (e) {
      console.log(e);
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
      });

      return originalSet.apply(this, args);
    };

    pkg.prototype.get = function (...args: any) {
      redisLogger.addContent({
        key: args[0],
        value: args[1],
        time: new Date(),
        type: "get",
      });

      return originalGet.apply(this, args);
    };
  } else if (packageName === "commander") {
    const originalAction = pkg.action;

    pkg.action = function (...args: any) {
      commandLogger.addContent({
        test: "test",
      });

      return originalAction.apply(this, args);
    };
  } else if (packageName === "knex") {
    console.log(pkg);
    const originalAction = pkg.QueryBuilder;

    console.log(originalAction);
    pkg.QueryBuilder = function (...args: any) {
      queryLogger("test");
      console.log("hit");
      return originalAction(this, args);
    };
  }

  if (typeof callback === "function") {
    callback();
  }
}

export { withObserver, globalCollector };
