/** @format */

import { Agenda } from "agenda";
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
import ScheduleWatcher from "../watchers/ScheduleWatcher";
import HTTPClientWatcher from "../watchers/HTTPClientWatcher";
import LogWatcher from "../watchers/LogWatcher";
import DumpWatcher from "../watchers/DumpWatcher";

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

function parseHeaders(headersString: string) {
  const [startLine, ...headerLines] = headersString.split("\r\n");

  // Parse the start line (HTTP method, path, version)
  const [method, path, version] = startLine.split(" ");

  // Parse the headers
  const headers: { [key: string]: string } = {};
  headerLines.forEach((line) => {
    const [key, value] = line.split(": ");
    if (key && value) {
      headers[key] = value;
    }
  });

  return {
    method,
    path,
    version,
    headers,
  };
}

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
      // QueryWatcher.addContent({ query, time });
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
  connection?: any;
}

async function globalCollector(
  packageName: string,
  options: GlobalCollectorOptions = {},
  callback: any
) {
  if (packageName === "exception") {
    process.on("uncaughtException", (error: Error) => {
      exceptionLogger.addContent({
        message: error.message,
        stack: error.stack,
        name: error.name,
        time: new Date(),
      });
    });

    process.on("unhandledRejection", (error: Error) => {
      exceptionLogger.addContent({
        message: error.message,
        stack: error.stack,
        name: error.name,
        time: new Date(),
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

      const originalSchedule = ProtoAgenda.schedule;
      const originalCancel = ProtoAgenda.cancel;
      const originalCreate = ProtoAgenda.create;
      const originalPurge = ProtoAgenda.purge;
      const originalScheduleJob = ProtoAgenda.schedule;
      const originalNow = ProtoAgenda.now;
      const originalSaveJob = ProtoAgenda.saveJob;

      try {
        ProtoAgenda.schedule = function (...args: any) {
          const job = args[0];
          jobLogger.addContent({
            name: job.attrs.name,
            data: args,
            time: new Date(),
            mode: "schedule",
            package: "agenda",
          });

          return originalSchedule.apply(this, args);
        };
      } catch (e) {
        console.error(e);
      }

      try {
        ProtoAgenda.cancel = function (...args: any) {
          const job = args[0];
          jobLogger.addContent({
            name: job.attrs.name,
            data: args,
            time: new Date(),
            mode: "cancel",
            package: "agenda",
          });

          return originalCancel.apply(this, args);
        };
      } catch (e) {
        console.error(e);
      }

      try {
        ProtoAgenda.create = function (...args: any) {
          const job = args[0];
          jobLogger.addContent({
            name: job.attrs.name,
            data: args,
            time: new Date(),
            mode: "create",
            package: "agenda",
          });

          return originalCreate.apply(this, args);
        };
      } catch (e) {
        console.error(e);
      }

      try {
        ProtoAgenda.purge = function (...args: any) {
          jobLogger.addContent({
            name: "all",
            data: args,
            time: new Date(),
            mode: "purge",
            package: "agenda",
          });

          return originalPurge.apply(this, args);
        };
      } catch (e) {
        console.error(e);
      }

      try {
        ProtoAgenda.now = function (...args: any) {
          const job = args[0];
          jobLogger.addContent({
            name: job.attrs.name,
            data: args,
            time: new Date(),
            mode: "now",
            package: "agenda",
          });

          return originalNow.apply(this, args);
        };
      } catch (e) {
        console.error(e);
      }

      try {
        ProtoAgenda.saveJob = function (...args: any) {
          const job = args[0];
          jobLogger.addContent({
            name: job.attrs.name,
            data: args,
            time: new Date(),
            mode: "save",
            package: "agenda",
          });

          return originalSaveJob.apply(this, args);
        };
      } catch (e) {
        console.error(e);
      }

      try {
        ProtoAgenda.scheduleJob = function (...args: any) {
          const job = args[0];
          jobLogger.addContent({
            name: job.attrs.name,
            data: args,
            time: new Date(),
            mode: "scheduleJob",
            package: "agenda",
          });

          return originalScheduleJob.apply(this, args);
        };
      } catch (e) {
        console.error(e);
      }

      try {
        ProtoAgenda.cancel = function (...args: any) {
          const job = args[0];
          jobLogger.addContent({
            name: job.attrs.name,
            data: args,
            time: new Date(),
            mode: "cancel",
            package: "agenda",
          });

          return originalCancel.apply(this, args);
        };
      } catch (e) {
        console.error(e);
      }

      try {
        ProtoAgenda.create = function (...args: any) {
          const job = args[0];
          jobLogger.addContent({
            name: job.attrs.name,
            data: args,
            time: new Date(),
            mode: "create",
            package: "agenda",
          });

          return originalCreate.apply(this, args);
        };
      } catch (e) {
        console.error(e);
      }

      try {
        ProtoAgenda.purge = function (...args: any) {
          jobLogger.addContent({
            name: "all",
            data: args,
            time: new Date(),
            mode: "purge",
            package: "agenda",
          });

          return originalPurge.apply(this, args);
        };
      } catch (e) {
        console.error(e);
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

    try {
      pkg.prototype.add = function (...args: any) {
        console.log(this);
        const job = args[0];
        jobLogger.addContent({
          name: this.Queue.name,
          data: args,
          time: new Date(),
          mode: "add",
          package: "bull",
        });

        return originalAddJob.apply(this, args);
      };
    } catch (e) {
      console.error(e);
    }

    try {
      pkg.prototype.process = function (...args: any) {
        const job = args[0];
        jobLogger.addContent({
          name: job.name,
          data: args,
          time: new Date(),
          mode: "process",
          package: "bull",
        });

        return originalProcess.apply(this, args);
      };
    } catch (e) {
      console.error(e);
    }

    try {
      pkg.prototype.retryJob = function (...args: any) {
        const job = args[0];
        jobLogger.addContent({
          name: job.name,
          data: args,
          time: new Date(),
          mode: "retry",
          package: "bull",
        });

        return originalRetryJob.apply(this, args);
      };
    } catch (e) {
      console.error(e);
    }

    try {
      pkg.prototype.start = function (...args: any) {
        const job = args[0];
        jobLogger.addContent({
          name: job.name,
          data: args,
          time: new Date(),
          mode: "start",
          package: "bull",
        });

        return originalStartJob.apply(this, args);
      };
    } catch (e) {
      console.error(e);
    }

    try {
      pkg.prototype.pause = function (...args: any) {
        const job = args[0];
        jobLogger.addContent({
          name: job.name,
          data: args,
          time: new Date(),
          mode: "pause",
          package: "bull",
        });

        return originalPauseJob.apply(this, args);
      };
    } catch (e) {
      console.error(e);
    }

    try {
      pkg.prototype.resume = function (...args: any) {
        const job = args[0];
        jobLogger.addContent({
          name: job.name,
          data: args,
          time: new Date(),
          mode: "resume",
          package: "bull",
        });

        return originalResumeJob.apply(this, args);
      };
    } catch (e) {
      console.error(e);
    }

    try {
      pkg.prototype.processJob = function (...args: any) {
        const job = args[0];
        jobLogger.addContent({
          name: job.name,
          data: args,
          time: new Date(),
          mode: "processJob",
          package: "bull",
        });

        return originalProcessJob.apply(this, args);
      };
    } catch (e) {
      console.error(e);
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

      const originalError = ProtoLog4js.error;
      const originalWarn = ProtoLog4js.warn;
      const originalInfo = ProtoLog4js.info;
      const originalDebug = ProtoLog4js.debug;
      const originalTrace = ProtoLog4js.trace;
      const originalFatal = ProtoLog4js.fatal;

      try {
        ProtoLog4js.error = function (...args: any) {
          logLogger.addContent({
            level: "error",
            package: "log4js",
            message: args[0],
            time: new Date(),
          });
          return originalError.apply(this, args);
        };

        ProtoLog4js.warn = function (...args: any) {
          logLogger.addContent({
            level: "warn",
            package: "log4js",
            message: args[0],
            time: new Date(),
          });
          return originalWarn.apply(this, args);
        };

        ProtoLog4js.info = function (...args: any) {
          logLogger.addContent({
            level: "info",
            package: "log4js",
            message: args[0],
            time: new Date(),
          });
          return originalInfo.apply(this, args);
        };

        ProtoLog4js.debug = function (...args: any) {
          logLogger.addContent({
            level: "debug",
            package: "log4js",
            message: args[0],
            time: new Date(),
          });
          return originalDebug.apply(this, args);
        };

        ProtoLog4js.trace = function (...args: any) {
          logLogger.addContent({
            level: "trace",
            package: "log4js",
            message: args[0],
            time: new Date(),
          });
          return originalTrace.apply(this, args);
        };

        ProtoLog4js.fatal = function (...args: any) {
          logLogger.addContent({
            level: "fatal",
            package: "log4js",
            message: args[0],
            time: new Date(),
          });
          return originalFatal.apply(this, args);
        };
      } catch (e) {
        console.error(e);
      }
    }
  } else if (packageName === "pino") {
    if (options.connection) {
      const PinoLogger = options.connection;

      const originalError = PinoLogger.error;
      const originalWarn = PinoLogger.warn;
      const originalInfo = PinoLogger.info;
      const originalDebug = PinoLogger.debug;
      const originalFatal = PinoLogger.fatal;

      try {
        PinoLogger.error = function (...args: any) {
          logLogger.addContent({
            level: "error",
            package: "pino",
            message: args[0],
            time: new Date(),
          });
          return originalError.apply(this, args);
        };

        PinoLogger.warn = function (...args: any) {
          logLogger.addContent({
            level: "warn",
            package: "pino",
            message: args[0],
            time: new Date(),
          });
          return originalWarn.apply(this, args);
        };

        PinoLogger.info = function (...args: any) {
          logLogger.addContent({
            level: "info",
            package: "pino",
            message: args[0],
            time: new Date(),
          });
          return originalInfo.apply(this, args);
        };

        PinoLogger.debug = function (...args: any) {
          logLogger.addContent({
            level: "debug",
            package: "pino",
            message: args[0],
            time: new Date(),
          });
          return originalDebug.apply(this, args);
        };

        PinoLogger.fatal = function (...args: any) {
          logLogger.addContent({
            level: "fatal",
            package: "pino",
            message: args[0],
            time: new Date(),
          });
          return originalFatal.apply(this, args);
        };
      } catch (e) {
        console.error(e);
      }
    }
  } else if (packageName === "bunyan") {
    if (options.connection) {
      const BunyanLoggerProto = options.connection.__proto__;
      const originalError = BunyanLoggerProto.error;
      const originalWarn = BunyanLoggerProto.warn;
      const originalInfo = BunyanLoggerProto.info;
      const originalDebug = BunyanLoggerProto.debug;
      const originalFatal = BunyanLoggerProto.fatal;
      const originalTrace = BunyanLoggerProto.trace;

      try {
        BunyanLoggerProto.error = function (...args: any) {
          logLogger.addContent({
            level: "error",
            package: "bunyan",
            message: args[0],
            time: new Date(),
          });
          return originalError.apply(this, args);
        };

        BunyanLoggerProto.warn = function (...args: any) {
          logLogger.addContent({
            level: "warn",
            package: "bunyan",
            message: args[0],
            time: new Date(),
          });
          return originalWarn.apply(this, args);
        };

        BunyanLoggerProto.info = function (...args: any) {
          logLogger.addContent({
            level: "info",
            package: "bunyan",
            message: args[0],
            time: new Date(),
          });
          return originalInfo.apply(this, args);
        };

        BunyanLoggerProto.debug = function (...args: any) {
          logLogger.addContent({
            level: "debug",
            package: "bunyan",
            message: args[0],
            time: new Date(),
          });
          return originalDebug.apply(this, args);
        };

        BunyanLoggerProto.fatal = function (...args: any) {
          logLogger.addContent({
            level: "fatal",
            package: "bunyan",
            message: args[0],
            time: new Date(),
          });
          return originalFatal.apply(this, args);
        };

        BunyanLoggerProto.trace = function (...args: any) {
          logLogger.addContent({
            level: "trace",
            package: "bunyan",
            message: args[0],
            time: new Date(),
          });
          return originalTrace.apply(this, args);
        };
      } catch (e) {
        console.error(e);
      }
    }
  } else if (packageName === "winston") {
    if (options.connection) {
      const WinstonLoggerProto = options.connection.__proto__;
      const originalError = WinstonLoggerProto.error;
      const originalWarn = WinstonLoggerProto.warn;
      const originalInfo = WinstonLoggerProto.info;
      const originalLog = WinstonLoggerProto.log;

      try {
        WinstonLoggerProto.error = function (...args: any) {
          logLogger.addContent({
            level: "error",
            package: "winston",
            message: args[0],
            time: new Date(),
          });
          return originalError.apply(this, args);
        };

        WinstonLoggerProto.warn = function (...args: any) {
          logLogger.addContent({
            level: "warn",
            package: "winston",
            message: args[0],
            time: new Date(),
          });
          return originalWarn.apply(this, args);
        };

        WinstonLoggerProto.info = function (...args: any) {
          logLogger.addContent({
            level: "info",
            package: "winston",
            message: args[0],
            time: new Date(),
          });
          return originalInfo.apply(this, args);
        };

        WinstonLoggerProto.log = function (...args: any) {
          logLogger.addContent({
            level: "log",
            package: "winston",
            message: args[0],
            time: new Date(),
          });
          return originalLog.apply(this, args);
        };
      } catch (e) {
        console.error(e);
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

export { withObserver, globalCollector };
