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

const eventLogger = Object.create(EventsWatcher);
const requestLogger = Object.create(RequestWatcher);
const jobLogger = Object.create(JobWatcher);
const exceptionLogger = Object.create(ExceptionWatcher);
const notificationLogger = Object.create(NotificationWatcher);
const mailLogger = Object.create(MailWatcher);
const redisLogger = Object.create(RedisWatcher);

type LoggerType =
  | "event"
  | "job"
  | "exception"
  | "notification"
  | "query"
  | "mail"
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
  : any;

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

export default withObserver;
