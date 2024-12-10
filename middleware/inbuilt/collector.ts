/** @format */

import { redisCommandArgs, nodeCacheCommandsArgs } from "../../lib/constants";

function isPackageInstalled(npmPackage: string) {
  try {
    require.resolve(npmPackage);
    return true;
  } catch (e) {
    return false;
  }
}

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

export const collector = {
  fetchMonkeyPatch(logger: any) {
   
  },

  exceptionMonkeyPatch(loggerInstance: any, errors: any) {
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
  },

  mailerMonkeyPatch(loggerInstance: any, mailer: any) {
    for (const mail of mailer) {
      if (!isPackageInstalled(mail)) {
        throw new Error(`Package ${mail} is not installed`);
      }

      const pkg = require(mail);

      switch (mail) {
        case "nodemailer":
          this.nodeMailer(pkg, loggerInstance);
          break;
        default:
          break;
      }
    }
  },

  loggingMonkeyPatch(loggerInstance: any, logging: any) {
    for (const log of logging) {
      if (!isPackageInstalled(log.name)) {
        throw new Error(`Package ${log.name} is not installed`);
      }

      const pkg = require(log.name);

      switch (log.name) {
        case "winston":
          this.winston(pkg, loggerInstance, log.connection);
          break;
        default:
          break;
      }
    }
  },

  jobsMonkeyPatch(loggerInstance: any, jobs: any) {
    for (const job of jobs) {
      if (!isPackageInstalled(job)) {
        throw new Error(`Package ${job} is not installed`);
      }

      const pkg = require(job);

      switch (job) {
        case "node-schedule":
          this.nodeSchedule(pkg, loggerInstance);
          break;
        default:
          break;
      }
    }
  },

  cacheMonkeyPatch(loggerInstance: any, cache: any) {},

  // Individual modules

  nodeMailer(pkg: any, loggerInstance: any) {
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
  },

  nodeRedis(pkg: any, loggerInstance: any) {},

  nodeSchedule(pkg: any, loggerInstance: any) {
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
  },

  winston(loggerInstance: any, connection: any) {
    const WinstonLoggerProto = connection.__proto__;

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
};
