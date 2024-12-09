/** @format */

import EventsWatcher from "../watchers/EventWatcher";
import RequestWatcher from "../watchers/RequestWatcher";
import JobWatcher from "../watchers/JobWatcher";
import ExceptionWatcher from "../watchers/ExceptionWatcher";
import NotificationWatcher from "../watchers/NotificationWatcher";
import QueryWatcher from "../watchers/QueryWatcher";
import MailWatcher from "../watchers/MailWatcher";
import RedisWatcher from "../watchers/RedisWatcher";
import CacheWatcher from "../watchers/CacheWatcher";
import ScheduleWatcher from "../watchers/ScheduleWatcher";
import HTTPClientWatcher from "../watchers/HTTPClientWatcher";
import LogWatcher from "../watchers/LogWatcher";
import DumpWatcher from "../watchers/DumpWatcher";
import { parseHeaders } from "../utils/utils";
import { Request, Response, NextFunction } from "express";

const eventLogger = new EventsWatcher();
const requestLogger = new RequestWatcher();
const jobLogger = new JobWatcher();
const scheduleLogger = new ScheduleWatcher();
const exceptionLogger = new ExceptionWatcher();
const notificationLogger = new NotificationWatcher();
const mailLogger = new MailWatcher();
const redisLogger = new RedisWatcher();
const cacheLogger = new CacheWatcher();
const queryLogger = new QueryWatcher();
const httpClientLogger = new HTTPClientWatcher();
const logLogger = new LogWatcher();
const dumpLogger = new DumpWatcher();

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
  connection?: any;
}

async function globalCollector(
  packageName: string,
  options: GlobalCollectorOptions = {},
  callback: any
) {
  if (packageName === "exception") {
    const ERROR_TYPES = ["uncaughtException", "unhandledRejection"];
    ERROR_TYPES.forEach((type) => {
      process.on(type, (error: Error) => {
        exceptionLogger.addContent({
          message: error.message,
          stack: error.stack,
          name: error.name,
          time: new Date(),
        });
      });
    });
    return;
  }

  if (packageName === "fetch") {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async function (url, options = {}) {
      const startTime = Date.now();

      const req = new Request(url, options);
      try {
        const response = await originalFetch(url, options);
        const duration = Date.now() - startTime;
        const memoryUsage = process.memoryUsage();

        const responseCopy = response.clone();

        httpClientLogger.addContent({
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

  if (!isPackageInstalled(packageName)) {
    throw new Error(`Package ${packageName} is not installed`);
  }

  const pkg = require(packageName);

  if (packageName === "pusher") {
    const originalTrigger = pkg.prototype.trigger;
    try {
      pkg.prototype.trigger = function (...args: any) {
        notificationLogger.addContent({
          channel: args[0],
          name: args[1],
          data: args[2],
          time: new Date(),
        });
        return originalTrigger.apply(this, args);
      };
    } catch (e) {
      console.error(e);
    }
  } else if (packageName === "heapdump") {
    const originalWriteSnapshot = pkg.writeSnapshot;

    try {
      pkg.writeSnapshot = function (...args: any) {
        console.log(args[0]);
        dumpLogger.addContent({
          fileName: args[0],
          time: new Date(),
        });
        return originalWriteSnapshot.apply(this, args);
      };
    } catch (e) {
      console.error(e);
    }
  } else if (packageName === "axios") {
    const originalRequest = pkg.request;
    const originalGet = pkg.get;
    const originalPost = pkg.post;
    const originalPut = pkg.put;
    const originalPatch = pkg.patch;
    const originalDelete = pkg.delete;

    try {
      pkg.request = function (...args: any) {
        const req = originalRequest.apply(this, args);
        const start = Date.now();

        req.then((res: any) => {
          const duration = Date.now() - start;
          const memoryUsage = process.memoryUsage();

          httpClientLogger.addContent({
            method: res.request.method,
            url: res.config.url,
            timestamp: new Date(),
            status: res.status,
            duration,
            memoryUsage,
            payload: req.data,
            options: args,
            headers: res.request._header,
            response: res.data,
          });
        });

        return req;
      };
    } catch (e) {
      console.error(e);
    }

    try {
      pkg.get = function (...args: any) {
        const req = originalGet.apply(this, args);
        const start = Date.now();

        req.then((res: any) => {
          const duration = Date.now() - start;
          const memoryUsage = process.memoryUsage();

          httpClientLogger.addContent({
            method: res.request.method,
            url: res.config.url,
            timestamp: new Date(),
            status: res.status,
            duration,
            memoryUsage,
            payload: req.data,
            options: args,
            headers: res.request._header,
            response: res.data,
          });
        });

        return req;
      };
    } catch (e) {
      console.error(e);
    }

    try {
      pkg.post = function (...args: any) {
        const req = originalPost.apply(this, args);
        const start = Date.now();

        req.then((res: any) => {
          const duration = Date.now() - start;
          const memoryUsage = process.memoryUsage();

          httpClientLogger.addContent({
            method: res.request.method,
            url: res.config.url,
            timestamp: new Date(),
            status: res.status,
            duration,
            memoryUsage,
            payload: req.data,
            options: args,
            headers: res.request._header,
            response: res.data,
          });
        });

        return req;
      };
    } catch (e) {
      console.error(e);
    }

    try {
      pkg.put = function (...args: any) {
        const req = originalPut.apply(this, args);
        const start = Date.now();

        req.then((res: any) => {
          const duration = Date.now() - start;
          const memoryUsage = process.memoryUsage();

          httpClientLogger.addContent({
            method: res.request.method,
            url: res.config.url,
            timestamp: new Date(),
            status: res.status,
            duration,
            memoryUsage,
            payload: req.data,
            options: args,
            headers: res.request._header,
            response: res.data,
          });
        });

        return req;
      };
    } catch (e) {
      console.error(e);
    }

    try {
      pkg.patch = function (...args: any) {
        const req = originalPatch.apply(this, args);
        const start = Date.now();

        req.then((res: any) => {
          const duration = Date.now() - start;
          const memoryUsage = process.memoryUsage();

          httpClientLogger.addContent({
            method: res.request.method,
            url: res.config.url,
            timestamp: new Date(),
            status: res.status,
            duration,
            memoryUsage,
            payload: req.data,
            options: args,
            headers: res.request._header,
            response: res.data,
          });
        });

        return req;
      };
    } catch (e) {
      console.error(e);
    }

    try {
      pkg.delete = function (...args: any) {
        const req = originalDelete.apply(this, args);
        const start = Date.now();

        req.then((res: any) => {
          const duration = Date.now() - start;
          const memoryUsage = process.memoryUsage();

          httpClientLogger.addContent({
            method: res.request.method,
            url: res.config.url,
            timestamp: new Date(),
            status: res.status,
            duration,
            memoryUsage,
            payload: req.data,
            options: args,
            headers: res.request._header,
            response: res.data,
          });
        });

        return req;
      };
    } catch (e) {
      console.error(e);
    }
  } else if (packageName === "https") {
    const originalRequest = pkg.request;
    const originalGet = pkg.get;

    try {
      pkg.request = function (...args: any) {
        const req = originalRequest.apply(this, args);
        const start = Date.now();

        const headers = args[0]?.headers || {};
        if (headers["User-Agent"] && headers["User-Agent"].includes("axios")) {
          console.log("Axios request detected, skipping custom handling.");
          req.end();
          return req; // Exit early for Axios requests
        }

        req.on("response", (res: any) => {
          const memoryUsage = process.memoryUsage();
          const duration = Date.now() - start;
          let data = "";
          res.on("data", (chunk: any) => {
            data += chunk;
          });

          res.on("end", () => {
            const headersObject: { [key: string]: string } = {};
            for (let i = 0; i < req.res.rawHeaders.length; i += 2) {
              const key = req.res.rawHeaders[i];
              const value = req.res.rawHeaders[i + 1];
              headersObject[key] = value;
            }

            httpClientLogger.addContent({
              method: req.method,
              url: req.protocol + "//" + req.host + req.path,
              timestamp: new Date(),
              status: req.res.statusCode,
              duration,
              memoryUsage,
              options: args,
              headers: parseHeaders(req._header),
              rawHeaders: headersObject,
              response: JSON.parse(data),
            });
          });
        });

        req.end();
        return req;
      };
    } catch (e) {
      console.error(e);
    }

    try {
      pkg.get = function (...args: any) {
        const req = originalGet.apply(this, args);
        const start = Date.now();

        req.on("response", (res: any) => {
          console.log("response get https");
          const duration = Date.now() - start;
          const memoryUsage = process.memoryUsage();

          let data = "";
          res.on("data", (chunk: any) => {
            data += chunk;
          });

          res.on("end", () => {
            const headersObject: { [key: string]: string } = {};
            for (let i = 0; i < req.res.rawHeaders.length; i += 2) {
              const key = req.res.rawHeaders[i];
              const value = req.res.rawHeaders[i + 1];
              headersObject[key] = value;
            }

            httpClientLogger.addContent({
              method: req.method,
              url: req.protocol + "//" + req.host + req.path,
              timestamp: new Date(),
              status: req.res.statusCode,
              duration,
              memoryUsage,
              options: args,
              headers: parseHeaders(req._header),
              rawHeaders: headersObject,
              response: JSON.parse(data),
            });
          });
        });

        return req;
      };
    } catch (e) {
      console.error(e);
    }
  } else if (packageName === "http") {
    const originalRequest = pkg.request;
    const originalGet = pkg.get;

    try {
      pkg.request = function (...args: any) {
        const req = originalRequest.apply(this, args);
        const memoryUsage = process.memoryUsage();
        const start = Date.now();

        req.on("response", (res: any) => {
          console.log("response request http");
          const duration = Date.now() - start;
          httpClientLogger.addContent({
            method: req.method,
            url: req.path,
            timestamp: new Date(),
            status: res?.statusCode || req.res.statusCode,
            duration,
            ipAddress: req.socket.remoteAddress,
            sockets: req.agent?.sockets || "N/A",
            memoryUsage,
            hostname: req.hostname,
            servername: res.servername || "unknown",
            payload: req.body || "N/A",
            protocol: req.agent.protocol,
            options: req.agent?.options || "N/A",
            session: req.session || {},
            response: req._events.response(),
            headers: req._header,
          });
        });

        return req;
      };
    } catch (e) {
      console.error(e);
    }

    try {
      pkg.get = function (...args: any) {
        const req = originalGet.apply(this, args);

        const start = Date.now();

        req.on("response", (res: any) => {
          console.log("response get http");
          const duration = Date.now() - start;
          const memoryUsage = process.memoryUsage();

          let data = "";
          res.on("data", (chunk: any) => {
            data += chunk;
          });

          res.on("end", () => {
            const headersObject: { [key: string]: string } = {};
            for (let i = 0; i < req.res.rawHeaders.length; i += 2) {
              const key = req.res.rawHeaders[i];
              const value = req.res.rawHeaders[i + 1];
              headersObject[key] = value;
            }

            httpClientLogger.addContent({
              method: req.method,
              url: req.path,
              timestamp: new Date(),
              status: req.res.statusCode,
              duration,
              memoryUsage,
              hostname: req.host,
              protocol: req.protocol,
              options: req.agent?.options || "N/A",
              session: req.session || {},
              headers: parseHeaders(req._header),
              rawHeaders: headersObject,
              version: req.res.httpVersion,
              response: JSON.parse(data),
            });
          });
        });

        return req;
      };
    } catch (e) {
      console.error(e);
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
      console.error(e);
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

            const originalSend = res.send;
            res.send = function (body: any) {
              res.locals.responseBody = body;
              return originalSend.call(this, body);
            };

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
                  hostname: req.hostname,
                  payload: req.body,
                  session: req.session || {},
                  response: JSON.parse(res.locals.responseBody)[0],
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
      console.error(e);
    }
  } else if (packageName === "agenda") {
    if (options.connection) {
      const ProtoAgenda = options.connection.__proto__;

      const FN = {
        'schedule': ProtoAgenda.schedule,
        'cancel': ProtoAgenda.cancel,
        'create': ProtoAgenda.create,
        'purge': ProtoAgenda.purge,
        'scheduleJob': ProtoAgenda.scheduleJob,
        'now': ProtoAgenda.now,
        'saveJob': ProtoAgenda.saveJob
      }

      try {
        for (const [key, value] of Object.entries(FN)) {
          ProtoAgenda[key] = function (...args: any) {
            const job = args[0];
            jobLogger.addContent({
              name: job.attrs.name,
              data: args,
              time: new Date(),
              mode: key,
              package: "agenda",
            });

            return value.apply(this, args);
          };
        }
      } catch (e) {
        console.error(e)
      }
    }
  } else if (packageName === "bull") {
    const originalProcess = pkg.prototype.process;
    const originalRetryJob = pkg.prototype.retryJob;
    const originalStartJob = pkg.prototype.start;
    const originalPauseJob = pkg.prototype.pause;
    const originalResumeJob = pkg.prototype.resume;
    const originalProcessJob = pkg.prototype.processJob;
    const originalAddJob = pkg.prototype.add;

    const FN = {
      'add': originalAddJob,
      'process': originalProcess,
      'retry': originalRetryJob,
      'start': originalStartJob,
      'pause': originalPauseJob,
      'resume': originalResumeJob,
      'processJob': originalProcessJob
    }

    try {
      for (const [key, value] of Object.entries(FN)) {
        pkg.prototype[key] = function (...args: any) {
          const job = args[0];
          jobLogger.addContent({
            name: this.Queue.name,
            data: args,
            time: new Date(),
            mode: key,
            package: "bull",
          });

          return value.apply(this, args);
        };
      }
    } catch (e) {
      console.error(e)
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
      console.error(e);
    }

    let originalCancelJob = pkg.cancelJob;
    try {
      pkg.cancelJob = function (...args: any) {
        scheduleLogger.addContent({
          name: args[0],
          info: "",
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
          name: args[0],
          info: args[1],
          time: new Date(),
          mode: "reschedule",
        });

        return originalRescheduleJob.apply(this, args);
      };
    } catch (e) {
      console.error(e);
    }
  } else if (packageName === "log4js") {
    if (options.connection) {
      const ProtoLog4js = options.connection.__proto__;

      const FN = {
        'error': ProtoLog4js.error,
        'warn': ProtoLog4js.warn,
        'info': ProtoLog4js.info,
        'debug': ProtoLog4js.debug,
        'trace': ProtoLog4js.trace,
        'fatal': ProtoLog4js.fatal
      }

      try {
        for (const [key, value] of Object.entries(FN)) {
          ProtoLog4js[key] = function (...args: any) {
            logLogger.addContent({
              level: key,
              package: "log4js",
              message: args[0],
              time: new Date(),
            });
            return value.apply(this, args);
          };
        }
      } catch (e) {
        console.error(e)
      }
    }
  } else if (packageName === "pino") {
    if (options.connection) {
      const PinoLogger = options.connection;


      const FN = {
        'error': PinoLogger.error,
        'warn': PinoLogger.warn,
        'info': PinoLogger.info,
        'debug': PinoLogger.debug,
        'fatal': PinoLogger.fatal
      }

      try {
        for (const [key, value] of Object.entries(FN)) {
          PinoLogger[key] = function (...args: any) {
            logLogger.addContent({
              level: key,
              package: "pino",
              message: args[0],
              time: new Date(),
            });
            return value.apply(this, args);
          };
        }
      } catch (e) {
        console.error(e)
      }
    }
  } else if (packageName === "bunyan") {
    if (options.connection) {
      const BunyanLoggerProto = options.connection.__proto__;

      const FN = {
        'error': BunyanLoggerProto.error,
        'warn': BunyanLoggerProto.warn,
        'info': BunyanLoggerProto.info,
        'debug': BunyanLoggerProto.debug,
        'fatal': BunyanLoggerProto.fatal,
        'trace': BunyanLoggerProto.trace
      }

      try {
        for (const [key, value] of Object.entries(FN)) {
          BunyanLoggerProto[key] = function (...args: any) {
            logLogger.addContent({
              level: key,
              package: "bunyan",
              message: args[0],
              time: new Date(),
            });
            return value.apply(this, args);
          };
        }
      } catch (e) {
        console.error(e)
      }
    }
  } else if (packageName === "winston") {
    if (options.connection) {
      const WinstonLoggerProto = options.connection.__proto__;

      const FN = {
        'error': WinstonLoggerProto.error,
        'warn': WinstonLoggerProto.warn,
        'info': WinstonLoggerProto.info,
        'log': WinstonLoggerProto.log
      }

      try {
        for (const [key, value] of Object.entries(FN)) {
          WinstonLoggerProto[key] = function (...args: any) {
            logLogger.addContent({
              level: key,
              package: "winston",
              message: args[0],
              time: new Date(),
            });
            return value.apply(this, args);
          };
        }
      } catch (e) {
        console.error(e)
      }
    }
  } else if (packageName === "lru-cache") {
    if (options.connection) {
      const LRUCache = options.connection;
      const commandArgsMapping = {
        get: ["key"],
        set: ["key", "value"],
        has: ["key"],
      };

      for (const key of Object.keys(commandArgsMapping)) {
        const originalFn = LRUCache[key];
        const argMap =
          commandArgsMapping[key as keyof typeof commandArgsMapping];
        const logContent: { [key: string]: any } = {
          time: new Date(),
          type: key,
        };

        try {
          LRUCache[key] = function (...args: any) {
            argMap.forEach((arg, index) => {
              logContent[arg] = args[index];
            });

            logContent["package"] = "lru-cache";

            cacheLogger.addContent(logContent);
            return originalFn.apply(this, args);
          };
        } catch (e) {
          console.error(e);
        }
      }
    }
  } else if (packageName === "quick-lru") {
    if (options.connection) {
    }
  } else if (packageName === "node-cache") {
    if (options.connection) {
      const nodeCacheConnection = options.connection;
      const commandArgsMapping = {
        get: ["key"],
        set: ["key", "value"],
        mget: ["key"],
        mset: ["hash", "field", "value"],
        del: ["key"],
        take: ["key"],
        ttl: ["key"],
        getTtl: ["key"],
        keys: ["key"],
        DECR: ["key"],
        has: ["key"],
        flushAll: [],
        flushStats: [],
      };

      for (const key of Object.keys(commandArgsMapping)) {
        const originalFn = nodeCacheConnection[key];
        const argMap =
          commandArgsMapping[key as keyof typeof commandArgsMapping];
        const logContent: { [key: string]: any } = {
          time: new Date(),
          type: key,
        };

        try {
          nodeCacheConnection[key] = function (...args: any) {
            argMap.forEach((arg, index) => {
              logContent[arg] = args[index];
            });

            logContent["stdTTL"] = this.options.stdTTL;
            logContent["deleteOnExpire"] = this.options.deleteOnExpire;
            logContent["checkPeriod"] = this.options.checkperiod;
            logContent["stats"] = this.stats;
            logContent["package"] = "node-cache";

            cacheLogger.addContent(logContent);
            return originalFn.apply(this, args);
          };
        } catch (e) {
          console.error(e);
        }
      }
    }
  } else if (packageName === "redis") {
    if (options.connection) {
      let redis = await options.connection;
      const RedisClientProto = redis.__proto__.__proto__;

      const commandArgsMapping = {
        get: ["key"],
        set: ["key", "value"],
        GET: ["key"],
        SET: ["key", "value"],
        HSET: ["hash", "field", "value"],
        hSet: ["hash", "field", "value"],
        HGET: ["hash", "field"],
        hGet: ["hash", "field"],
        HGETALL: ["hash"],
        hGetAll: ["hash"],
        DEL: ["key"],
        del: ["key"],
        EXISTS: ["key"],
        exists: ["key"],
        INCR: ["key"],
        incr: ["key"],
        DECR: ["key"],
        decr: ["key"],
        APPEND: ["key", "value"],
        append: ["key", "value"],
        HDEL: ["hash", "field"],
        hDel: ["hash", "field"],
        HEXISTS: ["hash", "field"],
        hExists: ["hash", "field"],
        HINCRBY: ["hash", "field", "increment"],
        hIncrBy: ["hash", "field", "increment"],
        HLEN: ["hash"],
        hLen: ["hash"],
        LPUSH: ["key", "value"],
        lPush: ["key", "value"],
        LPOP: ["key"],
        lPop: ["key"],
        LLEN: ["key"],
        lLen: ["key"],
        LINDEX: ["key", "index"],
        lIndex: ["key", "index"],
        RPUSH: ["key", "value"],
        rPush: ["key", "value"],
        RPOP: ["key"],
        rPop: ["key"],
        SADD: ["key", "value"],
        sAdd: ["key", "value"],
        SREM: ["key", "value"],
        sRem: ["key", "value"],
        SCARD: ["key"],
        sCard: ["key"],
        SMEMBERS: ["key"],
        sMembers: ["key"],
        ZADD: ["key", "score", "value"],
        zAdd: ["key", "score", "value"],
        ZREM: ["key", "value"],
        zRem: ["key", "value"],
        ZCARD: ["key"],
        zCard: ["key"],
        ZRANGE: ["key", "start", "stop"],
        zRange: ["key", "start", "stop"],
        ZRANK: ["key", "member"],
        zRank: ["key", "member"],
        ZSCORE: ["key", "member"],
        zScore: ["key", "member"],
        ZREVRANK: ["key", "member"],
        zRevRank: ["key", "member"],
        ZINCRBY: ["key", "increment", "member"],
        zIncrBy: ["key", "increment", "member"],
      };

      for (const key of Object.keys(commandArgsMapping)) {
        const originalFn = RedisClientProto[key];
        const argMap =
          commandArgsMapping[key as keyof typeof commandArgsMapping];
        const logContent: { [key: string]: any } = {
          time: new Date(),
          type: key,
        };

        RedisClientProto[key] = function (...args: any) {
          argMap.forEach((arg, index) => {
            logContent[arg] = args[index];
          });

          logContent["package"] = "node-redis";

          redisLogger.addContent(logContent);
          return originalFn.apply(this, args);
        };
      }
    }
  } else if (packageName === "ioredis") {
    if (options.connection) {
      const IORedisProto = options.connection.__proto__.__proto__;

      const commandArgsMapping = {
        get: ["key"],
        set: ["key", "value"],
        hset: ["hash", "field", "value"],
        hget: ["hash", "field"],
        hgetall: ["hash"],
        del: ["key"],
        exists: ["key"],
        incr: ["key"],
        decr: ["key"],
        append: ["key", "value"],
        hdel: ["hash", "field"],
        hexists: ["hash", "field"],
        hincrby: ["hash", "field", "increment"],
        hlen: ["hash"],
        lpush: ["key", "value"],
        lopo: ["key"],
        llen: ["key"],
        lindex: ["key", "index"],
        rpush: ["key", "value"],
        rpop: ["key"],
        sadd: ["key", "value"],
        srem: ["key", "value"],
        scard: ["key"],
        smembers: ["key"],
        zadd: ["key", "score", "value"],
        zrem: ["key", "value"],
        zcard: ["key"],
        zrange: ["key", "start", "stop"],
        zrank: ["key", "member"],
        zscore: ["key", "member"],
        zrevrank: ["key", "member"],
        zincrby: ["key", "increment", "member"],
      };

      for (const key of Object.keys(commandArgsMapping)) {
        const originalFn = IORedisProto[key];
        const argMap =
          commandArgsMapping[key as keyof typeof commandArgsMapping];
        const logContent: { [key: string]: any } = {
          time: new Date(),
          type: key,
        };

        IORedisProto[key] = function (...args: any) {
          argMap.forEach((arg, index) => {
            logContent[arg] = args[index];
          });

          logContent["host"] = this.options.host;
          logContent["db"] = this.options.db;
          logContent["family"] = this.options.family;
          logContent["port"] = this.options.port;
          logContent["package"] = "ioredis";

          redisLogger.addContent(logContent);
          return originalFn.apply(this, args);
        };
      }
    }
  } else if (packageName === "knex") {
    if (options.connection) {
      const queryStartTimes: { [key: string]: number } = {};

      options.connection.on("query", (query: any) => {
        queryStartTimes[query.__knexQueryUid] = Date.now();
      });

      options.connection.on("query-response", (response: any, query: any) => {
        const startTime = queryStartTimes[query.__knexQueryUid];
        if (startTime) {
          const duration = Date.now() - startTime;

          if (!query?.sql.includes("observatory_entries")) {
            queryLogger.addContent({
              query: query.sql,
              time: new Date(),
              host: options.connection.client.config.connection.host,
              database: options.connection.client.config.connection.database,
              user: options.connection.client.config.connection.user,
              port: options.connection.client.config.connection.port,
              duration,
            });
          }
          delete queryStartTimes[query.__knexQueryUid];
        }
      });
    }
  }

  if (typeof callback === "function") {
    callback();
  }
}

export default globalCollector;
