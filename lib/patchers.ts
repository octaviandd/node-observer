/** @format */

import { NextFunction, Request, Response } from "express";
import {
  ioRedisCommandsArgs,
  redisCommandArgs,
  nodeCacheCommandsArgs,
} from "./constants";
import { parseHeaders } from "./utils";

// Path: lib/patchers.ts

/**
 * Monkey patch for exceptions to record leaving mails
 * @param pkg
 * @param loggerInstance
 * @returns @void
 */
export function nodeMailerPatcher(pkg: any, loggerInstance: any) {
  const originalTrigger = pkg.createTransport;

  try {
    pkg.createTransport = function (...args: any) {
      const transporterInstance = originalTrigger.apply(this, args);
      const originalSendMail = transporterInstance.sendMail;

      transporterInstance.sendMail = function (
        mailOptions: any,
        callback: any
      ) {
        loggerInstance.addContent({
          to: mailOptions.to,
          from: mailOptions.from,
          subject: mailOptions.subject,
          text: mailOptions.text,
          html: mailOptions.html,
          time: new Date(),
        });

        return originalSendMail.call(this, mailOptions, callback);
      };

      console.log("Node mailer patched");

      return transporterInstance;
    };
  } catch (e) {
    console.error(e);
    console.log("Node mailer patch failed");
  }
}

/**
 *  Monkey patch for sendgrid to record emails
 * @param pkg
 * @param loggerInstance
 * @returns @void
 */
export function sendGridPatcher(pkg: any, loggerInstance: any) {
  const originalTrigger = pkg.send;

  try {
    pkg.send = function (...args: any) {
      const transporterInstance = originalTrigger.apply(this, args);
      const originalSendMail = transporterInstance.send;

      transporterInstance.send = function (mailOptions: any) {
        loggerInstance.addContent({
          to: mailOptions.to,
          from: mailOptions.from,
          subject: mailOptions.subject,
          text: mailOptions.text,
          html: mailOptions.html,
          time: new Date(),
        });

        return originalSendMail.call(this, mailOptions);
      };

      return transporterInstance;
    };
  } catch (e) {
    console.error(e);
  }
}

/**
 * Monkey patch bunyan to record logs
 * @param loggerInstance
 * @param pkg
 * @param connection
 * @returns @void
 */
export async function bunyanPatcher(loggerInstance: any, connection: any) {
  const bunyan = await connection;
  const BunyanLoggerProto = bunyan.__proto__;

  const FN = {
    error: BunyanLoggerProto.error,
    warn: BunyanLoggerProto.warn,
    info: BunyanLoggerProto.info,
    debug: BunyanLoggerProto.debug,
    fatal: BunyanLoggerProto.fatal,
    trace: BunyanLoggerProto.trace,
  };

  try {
    for (const [key, value] of Object.entries(FN)) {
      BunyanLoggerProto[key] = function (...args: any) {
        loggerInstance.addContent({
          level: key,
          package: "bunyan",
          message: args[0],
          time: new Date(),
        });
        return value.apply(this, args);
      };
      console.log(`Bunyan ${key} method patched`);
    }
  } catch (e) {
    console.error(e);
    console.log("Bunyan patch failed");
  }
}

/**
 * Monkey patch for winston to record logs
 * @param loggerInstance
 * @param pkg
 * @param connection
 * @returns @void
 */
export async function winstonPatcher(loggerInstance: any, connection: any) {
  const winston = await connection;
  const WinstonLoggerProto = winston.__proto__;

  const FN = {
    error: WinstonLoggerProto.error,
    warn: WinstonLoggerProto.warn,
    info: WinstonLoggerProto.info,
    log: WinstonLoggerProto.log,
  };

  try {
    for (const [key, value] of Object.entries(FN)) {
      WinstonLoggerProto[key] = function (...args: any) {
        loggerInstance.addContent({
          level: key,
          package: "winston",
          message: args[0],
          time: new Date(),
        });
        return value.apply(this, args);
      };

      console.log(`Winston ${key} method patched`);
    }
  } catch (e) {
    console.error(e);
    console.log("Winston patch failed");
  }
}

/**
 *  Monkey patch for pino to record logs
 * @param logLogger
 * @param pkg
 * @param connection
 * @returns @void
 */
export async function pinoPatcher(logLogger: any, connection: any) {
  const pino = await connection;
  const FN = {
    error: pino.error,
    warn: pino.warn,
    info: pino.info,
    debug: pino.debug,
    fatal: pino.fatal,
  };

  try {
    for (const [key, value] of Object.entries(FN)) {
      pino[key] = function (...args: any) {
        logLogger.addContent({
          level: key,
          package: "pino",
          message: args[0],
          time: new Date(),
        });
        return value.apply(this, args);
      };
      console.log(`Pino ${key} method patched`);
    }
  } catch (e) {
    console.error(e);
    console.log("Pino patch failed");
  }
}

/**
 *  Monkey patch for lruCache to record cache
 * @param loggerInstance
 * @param pkg
 * @param connection
 * @returns @void
 */
export async function lruCachePatcher(
  loggerInstance: any,
  pkg = null,
  connection: any
) {
  const LRUCache = await connection;
  const commandArgsMapping = {
    get: ["key"],
    set: ["key", "value"],
    has: ["key"],
  };

  for (const key of Object.keys(commandArgsMapping)) {
    const originalFn = LRUCache[key];
    const argMap = commandArgsMapping[key as keyof typeof commandArgsMapping];
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

        loggerInstance.addContent(logContent);
        return originalFn.apply(this, args);
      };
    } catch (e) {
      console.error(e);
    }
  }
}

/**
 *  Monkey patch for node-cache to record redis operations
 * @param loggerInstance
 * @param pkg
 * @param connection
 * @returns @void
 */
export async function redisPatcher(
  loggerInstance: any,
  pkg: any,
  connection: any
) {
  const redis = await connection;
  const RedisClientProto = redis.__proto__.__proto__;

  for (const key of Object.keys(redisCommandArgs)) {
    const originalFn = RedisClientProto[key];
    const argMap = redisCommandArgs[key as keyof typeof redisCommandArgs];
    const logContent: { [key: string]: any } = {
      time: new Date(),
      type: key,
    };

    RedisClientProto[key] = function (...args: any) {
      argMap.forEach((arg, index) => {
        logContent[arg] = args[index];
      });

      logContent["package"] = "node-redis";

      loggerInstance.addContent(logContent);
      return originalFn.apply(this, args);
    };
  }
}

/**
 *  Monkey patch for ioredis to record redis operations via IORedis
 * @param loggerInstance
 * @param pkg
 * @param connection
 * @returns @void
 */
export async function ioRedisPatcher(
  loggerInstance: any,
  pkg = null,
  connection: any
) {
  const ioRedis = await connection;
  const IORedisProto = ioRedis.__proto__.__proto__;

  for (const key of Object.keys(ioRedisCommandsArgs)) {
    const originalFn = IORedisProto[key];
    const argMap = ioRedisCommandsArgs[key as keyof typeof ioRedisCommandsArgs];
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

      loggerInstance.addContent(logContent);
      return originalFn.apply(this, args);
    };
  }
}

/**
 *  Monkey patch for node-cache to record cache operations
 * @param loggerInstance
 * @param pkg
 * @param connection
 * @returns @void
 */
export async function nodeCachePatcher(
  loggerInstance: any,
  pkg: any,
  connection: any
) {
  const nodeCacheConnection = connection;

  for (const key of Object.keys(nodeCacheCommandsArgs)) {
    const originalFn = nodeCacheConnection[key];
    const argMap =
      nodeCacheCommandsArgs[key as keyof typeof nodeCacheCommandsArgs];
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

        loggerInstance.addContent(logContent);
        return originalFn.apply(this, args);
      };
    } catch (e) {
      console.error(e);
    }
  }
}

/**
 *  Monkey patch for node-schedule to record scheduled jobs
 * @param loggerInstance
 * @param pkg
 * @param connection
 * @returns @void
 */
export async function nodeSchedulePatcher(loggerInstance: any, pkg: any) {
  if (pkg) {
    const originalFns: { [key: string]: Function } = {
      scheduleJob: pkg.scheduleJob,
      cancelJob: pkg.cancelJob,
      rescheduleJob: pkg.rescheduleJob,
    };

    const logAction = (name: string, info: any, mode: string) => {
      loggerInstance.addContent({
        name: name || "",
        info: info || "",
        time: new Date(),
        mode,
      });
    };

    try {
      pkg.scheduleJob = function (...args: any) {
        const hasName = args.length > 2;
        const name = hasName ? args[0] : "";
        const info = hasName ? args[1] : args[0];
        const funcIndex = args.findIndex(
          (arg: any) => typeof arg === "function"
        );
        const originalFn = args[funcIndex];

        logAction(name, info, "set");

        args[funcIndex] = function (...innerArgs: any) {
          logAction(name, info, "run");
          return originalFn.apply(this, innerArgs);
        };

        console.log("Node schedule patched");
        return originalFns.scheduleJob.apply(this, args);
      };

      ["cancelJob", "rescheduleJob"].forEach((method) => {
        pkg[method] = function (...args: any) {
          logAction(args[0], args[1], method.replace("Job", "").toLowerCase());
          console.log("Node cancel and reschedule patched");
          return originalFns[method].apply(this, args);
        };
      });
    } catch (e) {
      console.error(e);
      console.log("Node schedule patch failed");
    }
  }
}

/**
 * Monkey patch for pusher to record pusher notifications
 * @param loggerInstance
 * @param pkg
 * @param connection
 * @returns @void
 */
export async function pusherPatcher(
  loggerInstance: any,
  pkg: any,
  connection: any
) {
  if (pkg) {
    const originalTrigger = pkg.prototype.trigger;
    const originalBatch = pkg.prototype.triggerBatch;
    const originalExclusive = pkg.prototype.triggerExclusive;
    const originalMultiChannel = pkg.prototype.triggerMultiChannel;

    const FN = {
      trigger: originalTrigger,
      triggerBatch: originalBatch,
      triggerExclusive: originalExclusive,
      triggerMultiChannel: originalMultiChannel,
    };

    try {
      for (const [key, value] of Object.entries(FN)) {
        pkg.prototype[key] = function (...args: any) {
          loggerInstance.addContent({
            type: key,
            package: "pusher",
            channel: args[0],
            event: args[1],
            data: args[2],
            time: new Date(),
          });
          return value.apply(this, args);
        };
      }
    } catch (e) {
      console.error(e);
    }
  }
}

/**
 *  Monkey patch for agenda to record scheduled jobs
 * @param loggerInstance
 * @param pkg
 * @param connection
 * @returns @void
 */
export async function knexPatcher(
  loggerInstance: any,
  pkg: any,
  connection: any
) {
  if (connection) {
    const queryStartTimes: { [key: string]: number } = {};

    connection.on("query", (query: any) => {
      queryStartTimes[query.__knexQueryUid] = Date.now();
    });

    connection.on("query-response", (response: any, query: any) => {
      const startTime = queryStartTimes[query.__knexQueryUid];
      if (startTime) {
        const duration = Date.now() - startTime;

        if (!query?.sql.includes("observatory_entries")) {
          loggerInstance.addContent({
            query: query.sql,
            time: new Date(),
            host: connection.client.config.connection.host,
            database: connection.client.config.connection.database,
            user: connection.client.config.connection.user,
            port: connection.client.config.connection.port,
            duration,
          });
        }
        delete queryStartTimes[query.__knexQueryUid];
      }
    });
  }
}

/**
 *  Monkey patch for mysql to record queries
 * @param loggerInstance
 * @param pkg
 * @param connection
 * @returns @void
 */
export async function mysqlPatcher(
  loggerInstance: any,
  pkg: any,
  connection: any
) {
  if (connection) {
    connection.on("enqueue", (query: any) => {
      loggerInstance.addContent({
        query: query.sql,
        time: new Date(),
        host: connection.config.host,
        database: connection.config.database,
        user: connection.config.user,
        port: connection.config.port,
      });
    });
  }
}

export async function mysql2Patcher(
  loggerInstance: any,
  pkg: any,
  connection: any
) {
  if (connection) {
    connection.on("enqueue", (query: any) => {
      loggerInstance.addContent({
        query: query.sql,
        time: new Date(),
        host: connection.config.host,
        database: connection.config.database,
        user: connection.config.user,
        port: connection.config.port,
      });
    });
  }
}

/**
 *  Monkey patch for mongoose to record queries
 * @param loggerInstance
 * @param pkg
 * @param connection
 * @returns @void
 */
export async function mongoosePatcher(
  loggerInstance: any,
  pkg: any,
  connection: any
) {
  if (connection) {
    connection.on("query", (query: any) => {
      loggerInstance.addContent({
        query: query._conditions,
        time: new Date(),
        host: connection.host,
        database: connection.name,
        port: connection.port,
      });
    });
  }
}

/**
 *  Monkey patch for pg to record queries
 * @param loggerInstance
 * @param pkg
 * @param connection
 * @returns @void
 */

export async function pgPatcher(
  loggerInstance: any,
  pkg: any,
  connection: any
) {
  if (connection) {
    connection.on("query", (query: any) => {
      loggerInstance.addContent({
        query: query.text,
        time: new Date(),
        host: connection.host,
        database: connection.database,
        user: connection.user,
        port: connection.port,
      });
    });
  }
}

/**
 *  Monkey patch for request to record requests
 * @param loggerInstance
 * @param pkg
 * @returns @void
 */
export async function expressRequestPatcher(loggerInstance: any, pkg: any) {
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
              loggerInstance.addContent({
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
                // session: req.session || {},
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
}

/**
 *  Monkey patch for axios to record requests
 * @param loggerInstance
 * @param pkg
 * @returns @void
 */
export async function axiosPatcher(loggerInstance: any, pkg: any) {
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

        loggerInstance.addContent({
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

        loggerInstance.addContent({
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

        loggerInstance.addContent({
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

        loggerInstance.addContent({
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

        loggerInstance.addContent({
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

        loggerInstance.addContent({
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
}

/**
 *  Monkey patch for bull to record jobs
 * @param loggerInstance
 * @param pkg
 * @param connection
 * @returns @void
 */
export async function bullPatcher(
  loggerInstance: any,
  pkg: any,
  connection: any
) {
  const originalProcess = pkg.prototype.process;
  const originalRetryJob = pkg.prototype.retryJob;
  const originalStartJob = pkg.prototype.start;
  const originalPauseJob = pkg.prototype.pause;
  const originalResumeJob = pkg.prototype.resume;
  const originalProcessJob = pkg.prototype.processJob;
  const originalAddJob = pkg.prototype.add;

  const FN = {
    add: originalAddJob,
    process: originalProcess,
    retry: originalRetryJob,
    start: originalStartJob,
    pause: originalPauseJob,
    resume: originalResumeJob,
    processJob: originalProcessJob,
  };

  try {
    for (const [key, value] of Object.entries(FN)) {
      pkg.prototype[key] = function (...args: any) {
        const job = args[0];
        loggerInstance.addContent({
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
    console.error(e);
  }
}

/**
 *  Monkey patch for agenda to record jobs
 * @param loggerInstance
 * @param pkg
 * @param connection
 * @returns @void
 */
export async function agendaPatcher(
  loggerInstance: any,
  pkg: any,
  connection: any
) {
  if (connection) {
    const ProtoAgenda = connection.__proto__;

    const FN = {
      schedule: ProtoAgenda.schedule,
      cancel: ProtoAgenda.cancel,
      create: ProtoAgenda.create,
      purge: ProtoAgenda.purge,
      scheduleJob: ProtoAgenda.scheduleJob,
      now: ProtoAgenda.now,
      saveJob: ProtoAgenda.saveJob,
    };

    try {
      for (const [key, value] of Object.entries(FN)) {
        ProtoAgenda[key] = function (...args: any) {
          const job = args[0];
          loggerInstance.addContent({
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
      console.error(e);
    }
  }
}

/**
 * Fetch monkey patch to record fetch requests
 * @param logger
 * @returns @Response
 */
export function fetchPatch(logger: any) {
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
 * Monkey patch for log4js to record logs
 * @param loggerInstance
 * @param pkg
 * @param connection
 * @returns @void
 */
export function log4jsPatcher(loggerInstance: any, pkg: any, connection: any) {
  if (connection) {
    const ProtoLog4js = connection.__proto__;

    const FN = {
      error: ProtoLog4js.error,
      warn: ProtoLog4js.warn,
      info: ProtoLog4js.info,
      debug: ProtoLog4js.debug,
      trace: ProtoLog4js.trace,
      fatal: ProtoLog4js.fatal,
    };

    try {
      for (const [key, value] of Object.entries(FN)) {
        ProtoLog4js[key] = function (...args: any) {
          loggerInstance.addContent({
            level: key,
            package: "log4js",
            message: args[0],
            time: new Date(),
          });
          return value.apply(this, args);
        };
      }
    } catch (e) {
      console.error(e);
    }
  }
}

/**
 *  Monkey patch for http to record requests
 * @param loggerInstance
 * @param pkg
 * @returns @void
 */
export function httpPatcher(loggerInstance: any, pkg: any) {
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
        loggerInstance.addContent({
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

          loggerInstance.addContent({
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
}

/**
 *  Monkey patch for https to record requests
 * @param loggerInstance
 * @param pkg
 * @returns @void
 */
export function httpsPatcher(loggerInstance: any, pkg: any) {
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

          loggerInstance.addContent({
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

          loggerInstance.addContent({
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
}

/**
 *  Monkey patch for uncaught exceptions to record errors
 * @param loggerInstance
 * @returns @void
 */
export function uncaughtPatcher(loggerInstance: any) {
  process.on("uncaughtException", (error) => {
    loggerInstance.addContent({
      type: "uncaughtException",
      error,
      time: new Date(),
    });
  });
}

/**
 *  Monkey patch for unhandled rejections to record errors
 * @param loggerInstance
 * @returnS @void
 */
export function unhandledRejectionPatcher(loggerInstance: any) {
  process.on("unhandledRejection", (error) => {
    loggerInstance.addContent({
      type: "unhandledRejection",
      error,
      time: new Date(),
    });
  });
}
