
import { NextFunction, Request, Response } from "express";
import { ioRedisCommandsArgs, redisCommandArgs, nodeCacheCommandsArgs } from "./constants";


// Path: lib/patchers.ts


export function nodeMailer(pkg: any, loggerInstance: any) {
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

        return transporterInstance;
      };
    } catch (e) {
      console.error(e);
    }
}

export async function bunyan(loggerInstance: any, pkg = null, connection: any) {
   const bunyan = await connection;
   const BunyanLoggerProto =  bunyan.__proto__;

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
         loggerInstance.addContent({
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

export async function winston(loggerInstance: any, pkg = null, connection: any) {
  const winston = await connection;
   const WinstonLoggerProto = winston.__proto__;

   const FN = {
     'error': WinstonLoggerProto.error,
     'warn': WinstonLoggerProto.warn,
     'info': WinstonLoggerProto.info,
     'log': WinstonLoggerProto.log
   }

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
     }
   } catch (e) {
     console.error(e)
   }
}

export async function pino(logLogger: any, pkg = null, connection: any) {
 const pino = await connection;
  const FN = {
    'error': pino.error,
    'warn': pino.warn,
    'info': pino.info,
    'debug': pino.debug,
    'fatal': pino.fatal
  }

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
    }
  } catch (e) {
    console.error(e)
  }
}

export async function lruCache(loggerInstance: any, pkg = null, connection: any) {
  const LRUCache = await connection;
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

         loggerInstance.addContent(logContent);
         return originalFn.apply(this, args);
       };
     } catch (e) {
       console.error(e);
     }
   }
}

export async function redis(loggerInstance: any, pkg = null, connection: any) {
  let redis = await connection;
  const RedisClientProto = redis.__proto__.__proto__;

  for (const key of Object.keys(redisCommandArgs)) {
    const originalFn = RedisClientProto[key];
    const argMap =
      redisCommandArgs[key as keyof typeof redisCommandArgs];
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

export async function ioRedis(loggerInstance: any, pkg = null, connection: any) {
  const ioRedis = await connection;
 const IORedisProto = ioRedis.__proto__.__proto__;

 for (const key of Object.keys(ioRedisCommandsArgs)) {
    const originalFn = IORedisProto[key];
    const argMap =
      ioRedisCommandsArgs[key as keyof typeof ioRedisCommandsArgs];
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

export async function nodeCache(loggerInstance: any, pkg = null, connection: any) {
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


export async function nodeSchedule(loggerInstance: any, pkg: any, connection: any) {
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

        return originalFns.scheduleJob.apply(this, args);
      };

      ["cancelJob", "rescheduleJob"].forEach((method) => {
        pkg[method] = function (...args: any) {
          logAction(args[0], args[1], method.replace("Job", "").toLowerCase());
          return originalFns[method].apply(this, args);
        };
      });
    } catch (e) {
      console.error(e);
    }
  }
}

export async function pusher(loggerInstance: any, pkg: any, connection: any) {
  if (pkg) {
    const originalTrigger = pkg.prototype.trigger;
    const originalBatch = pkg.prototype.triggerBatch;
    const originalExclusive = pkg.prototype.triggerExclusive;
    const originalMultiChannel = pkg.prototype.triggerMultiChannel;

    const FN = {
      'trigger': originalTrigger,
      'triggerBatch': originalBatch,
      'triggerExclusive': originalExclusive,
      'triggerMultiChannel': originalMultiChannel
    }

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
      console.error(e)
    }
  }
}

export async function knex(loggerInstance: any, pkg: any, connection: any) {
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

export async function requestPatch(loggerInstance: any, pkg: any) {
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
}