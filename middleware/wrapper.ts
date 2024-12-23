/** @format */

// /** @format */

// import { LoggerType, MiddleWareParams } from "../types";
// import EventsWatcher from "../watchers/EventWatcher";
// import RequestWatcher from "../watchers/RequestWatcher";
// import JobWatcher from "../watchers/JobWatcher";
// import ExceptionWatcher from "../watchers/ExceptionWatcher";
// import NotificationWatcher from "../watchers/NotificationWatcher";
// import QueryWatcher from "../watchers/QueryWatcher";
// import MailWatcher from "../watchers/MailWatcher";
// import RedisWatcher from "../watchers/RedisWatcher";
// import CacheWatcher from "../watchers/CacheWatcher";
// import ScheduleWatcher from "../watchers/ScheduleWatcher";
// import HTTPClientWatcher from "../watchers/HTTPClientWatcher";
// import LogWatcher from "../watchers/LogWatcher";
// import DumpWatcher from "../watchers/DumpWatcher";

// const requestLogger = new RequestWatcher();
// const eventLogger = new EventsWatcher();
// const jobLogger = new JobWatcher();
// const exceptionLogger = new ExceptionWatcher();
// const notificationLogger = new NotificationWatcher();
// const queryLogger = new QueryWatcher();
// const mailLogger = new MailWatcher();
// const redisLogger = new RedisWatcher();
// const cacheLogger = new CacheWatcher();
// const scheduleLogger = new ScheduleWatcher();
// const httpClientLogger = new HTTPClientWatcher();
// const logWatcher = new LogWatcher();
// const dumpWatcher = new DumpWatcher();

// async function withObserver<T extends LoggerType>(
//   type: T,
//   params: MiddleWareParams<T>,
//   callback: any
// ) {
//   let time = new Date();

//   switch (type) {
//     case "request":
//       const { req, res, next } = params as MiddleWareParams<"request">;
//       const start = Date.now();

//       res.on("finish", () => {
//         const duration = Date.now() - start;

//         requestLogger.addContent({
//           method: req.method,
//           url: req.url,
//           timestamp: new Date(),
//           status: res.statusCode,
//           duration,
//           ipAddress: req.ip,
//           memoryUsage: process.memoryUsage(),
//           middleware: req.route ? req.route.path : "unknown",
//           controllerAction: req.route ? req.route.stack[0].name : "unknown",
//           hostname: req.hostname,
//           payload: req.body,
//           session: req.session ? req.session.id : "none",
//           response: res.locals || "none",
//           headers: req.headers,
//           body: req.body,
//         });
//       });
//       next();
//       break;
//     case "event":
//       let { eventName, props } = params as MiddleWareParams<"event">;
//       eventLogger.addContent({ eventName, props, time });
//       callback();
//       break;
//     case "job":
//       let { job } = params as MiddleWareParams<"job">;
//       jobLogger.addContent({ job, time });
//       callback();
//       break;
//     case "exception":
//       let { error } = params as MiddleWareParams<"exception">;
//       exceptionLogger.addContent({ error, time });
//       callback();
//       break;
//     case "notification":
//       let { message } = params as MiddleWareParams<"notification">;
//       notificationLogger.addContent({ message, time });
//       callback();
//       break;
//     case "query":
//       let { query } = params as MiddleWareParams<"query">;
//       queryLogger.addContent({ query, time });
//       callback();
//       break;
//     case "mail":
//       let { to, from, subject, text } = params as MiddleWareParams<"mail">;
//       mailLogger.addContent({ to, from, subject, text, time });
//       callback();
//       break;
//     case "redis":
//       let { key, value } = params as MiddleWareParams<"redis">;
//       redisLogger.addContent({ key, value, time });
//       callback();
//       break;
//     default:
//       console.log("No type specified");
//   }
// }

// export default withObserver;
