/** @format */

import express from "express";
import { runMigration, rollbackMigration } from "./database/migrate";
import routes from "./routes/routes";
import {
  withObserver,
  globalCollector,
} from "./middleware/collectorMiddleware";
import EventEmitter from "events";
import schedule from "node-schedule";
import Redis from "ioredis";
import nodemailer from "nodemailer";
import NodeCache from "node-cache";
import Pusher from "pusher";
import { Command } from "commander";
import knex from "knex";
import cors from "cors";
import connection from "./database/connection";
import mysql2 from "mysql2";
import http from "http";
import https from "https";
import { createLogger, format, transports } from "winston";
import Queue from "bull";
import { createClient } from "redis";
import redisStore from "./database/redis";
import os from "os";
import { LRUCache } from "lru-cache";
// import QuickLRU from "quick-lru";
import bunyan from "bunyan";
import pino from "pino";
import log4js from "log4js";
import sgMail from "@sendgrid/mail";
import axios from "axios";
import heapdump from "heapdump";
import Agenda from "agenda";

const pinoLogger = pino();
const logger4js = log4js.getLogger();

const redis = new Redis({
  port: 6379, // Redis port
  host: "127.0.0.1", // Redis host
  db: 0, // Optional database index
});

const mongoConnectionString = "mongodb://127.0.0.1/agenda";

const agenda = new Agenda({ db: { address: mongoConnectionString } });

const myCache = new NodeCache({ stdTTL: 100, checkperiod: 120 });
const myLRUCache = new LRUCache({ max: 1000 });
// const lru = new QuickLRU({ maxSize: 1000 });

const log = bunyan.createLogger({ name: "myapp" });

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.printf(
      ({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`
    )
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "combined.log" }),
  ],
});

globalCollector("heapdump", { log: true }, (pkg: any) => {});
globalCollector("axios", { log: true }, (pkg: any) => {});
globalCollector("bunyan", { log: true, connection: log }, (pkg: any) => {});
globalCollector("exception", { log: true }, (pkg: any) => {});
globalCollector("pusher", { log: true }, (pkg: any) => {});
globalCollector("nodemailer", { log: true }, (pkg: any) => {});
globalCollector("express", { log: true }, (pkg: any) => {});
globalCollector(
  "pino",
  { log: true, connection: pinoLogger },
  (pkg: any) => {}
);
globalCollector("node-schedule", { log: true }, (pkg: any) => {});
globalCollector(
  "node-cache",
  { log: true, connection: myCache },
  (pkg: any) => {}
);
globalCollector(
  "log4js",
  { log: true, connection: logger4js },
  (pkg: any) => {}
);
globalCollector("commander", { log: true }, (pkg: any) => {});
globalCollector("knex", { log: true, connection }, (pkg: any) => {});
globalCollector("http", { log: true }, (pkg: any) => {});
globalCollector("https", { log: true }, (pkg: any) => {});
globalCollector("winston", { log: true, connection: logger }, (pkg: any) => {});
globalCollector("bull", { log: true }, (pkg: any) => {});
globalCollector("agenda", { log: true, connection: agenda }, (pkg: any) => {});
globalCollector("fetch", { log: true }, (pkg: any) => {});
globalCollector(
  "redis",
  { log: true, connection: redisStore },
  (pkg: any) => {}
);
globalCollector("ioredis", { log: true, connection: redis }, (pkg: any) => {});
globalCollector(
  "lru-cache",
  { log: true, connection: myLRUCache },
  (pkg: any) => {}
);
// globalCollector("quick-lru", { log: true, connection: lru }, (pkg: any) => {});

const pusher = new Pusher({
  appId: "1900516",
  key: "388f3d0fd14c5d061f26",
  secret: "88f15826546ec27aa46d",
  cluster: "eu",
  useTLS: true,
});

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use("/observatory-api/data", routes);

// API routes
app.get("/", async (req, res) => {
  heapdump.writeSnapshot("~/Desktop/" + Date.now() + ".heapsnapshot");
  // log.info("Hello World bunyan");
  // pinoLogger.info("Hello World pino");

  // await redis.set("car", "toyota");

  // myLRUCache.set("test", "test");
  // myLRUCache.get("test");

  // const redis_store = await redisStore;
  // redis_store.set("test", "test");
  // logger.debug("Some debug messages");
  // logger4js.info("Some debug messages logger4js");
  // redis_store.get("test");

  // let fnLookup = [
  //   "set",
  //   "get",
  //   "SET",
  //   "GET",
  //   "HSET",
  //   "hSet",
  //   "HGET",
  //   "hGet",
  //   "HGETALL",
  //   "hGetAll",
  //   "del",
  //   "exists",
  //   "incr",
  //   "decr",
  //   "append",
  //   "HDEL",
  //   "HEXISTS",
  //   "HINCRBY",
  //   "HLEN",
  //   "LPUSH",
  //   "LPOP",
  //   "LLEN",
  //   "LINDEX",
  //   "RPUSH",
  //   "RPOP",
  //   "SADD",
  //   "SREM",
  //   "SCARD",
  //   "SMEMBERS",
  //   "ZADD",
  //   "ZREM",
  //   "ZCARD",
  //   "ZRANGE",
  //   "ZRANK",
  //   "ZSCORE",
  //   "ZREVRANK",
  //   "ZINCRBY",
  // ];

  // await redis_store.HSET("test3", "field1", "value1");
  // await redis_store.HGET("test3", "field1");
  // await redis_store.HGETALL("test3");
  // await redis_store.del("test3");
  // await redis_store.exists("test3");
  // await redis_store.incr("counter1");
  // await redis_store.decr("counter1");
  // await redis_store.append("string1", "appendValue");
  // await redis_store.HDEL("test3", "field1");
  // await redis_store.HEXISTS("test3", "field1");
  // await redis_store.HINCRBY("test3", "field1", 1);
  // await redis_store.HLEN("test3");
  // await redis_store.LPUSH("list1", "value1");
  // await redis_store.LPOP("list1");
  // await redis_store.LLEN("list1");
  // await redis_store.LINDEX("list1", 0);
  // await redis_store.RPUSH("list1", "value2");
  // await redis_store.RPOP("list1");
  // await redis_store.SADD("set1", "member1");
  // await redis_store.SREM("set1", "member1");
  // await redis_store.SCARD("set1");
  // await redis_store.SMEMBERS("set1");
  // await redis_store.ZADD("sortedSet1", { score: 1, value: "member1" });
  // await redis_store.ZREM("sortedSet1", "member1");
  // await redis_store.ZCARD("sortedSet1");
  // await redis_store.ZRANGE("sortedSet1", 0, 1);
  // await redis_store.ZRANK("sortedSet1", "member1");
  // await redis_store.ZSCORE("sortedSet1", "member1");
  // await redis_store.ZREVRANK("sortedSet1", "member1");
  // await redis_store.ZINCRBY("sortedSet1", 1, "member1");

  // const request = https.get(
  //   "https://jsonplaceholder.typicode.com/todos/1",
  //   (res) => {
  //     let responseData = "";
  //     res.on("data", (chunk) => {
  //       responseData += chunk;
  //     });
  //     res.on("end", () => {
  //       console.log("end hit");
  //       console.log("Response:", JSON.parse(responseData));
  //     });
  //   }
  // );

  await axios
    .get("https://jsonplaceholder.typicode.com/todos/1")
    .then((response) => {
      console.log(response.data);
    });

  const url = "https://jsonplaceholder.typicode.com/todos/1";

  // fetch(url)
  //   .then((response) => response.json())
  //   .then((jsonData) => console.log(jsonData));
  res.send({ test: "Hello World" });
  myCache.set("test", "test");
  myCache.get("test");

  // const emailQueue = new Queue("emailQueue");

  // // Add a job to the queue
  // const addEmailJob = async (email: string, subject: string, body: string) => {
  //   await emailQueue.add({
  //     email,
  //     subject,
  //     body,
  //   });
  //   console.log(`Job added to queue for: ${email}`);
  // };

  // // Simulate adding jobs
  // addEmailJob("user1@example.com", "Welcome!", "Hello, User1!");
  // addEmailJob(
  //   "user2@example.com",
  //   "Reminder",
  //   "Your subscription is expiring."
  // );

  // queue.add({ task: "Send email" });
  // redis.set("test", "test");
  // redis.get("test");
  // const emailQueue = new Queue("emailQueue");
  // emailQueue.add({
  //   email: "user@example.com",
  //   subject: "Welcome!",
  //   body: "Thanks for signing up!",
  // });
  // emailQueue.process(async (job) => {
  //   console.log("Sending email to:", job.data.email);
  //   // Simulate sending email
  //   await sendEmail(job.data.email, job.data.subject, job.data.body);
  // });
  // function sendEmail(email: string, subject: string, body: string) {
  //   return new Promise((resolve) =>
  //     setTimeout(() => {
  //       console.log(`Email sent to ${email}`);
  //       resolve(void 0);
  //     }, 1000)
  //   );
  // }
  // schedule.scheduleJob("life-universe-everything", "11 * * * *", function () {
  //   console.log("The answer to life, the universe, and everything!");
  // });

  // schedule.rescheduleJob("life-universe-everything", "12 * * * *");
  // schedule.cancelJob("life-universe-everything");
  // pusher.trigger("my-channel", "my-event", {
  //   message: "hello world",
  // });
  // // setTimeout(() => {
  // //   throw new Error("This is an uncaught exception!");
  // // }, 1000);
  // let data = await connection("migrations");
  // const eventEmiter = new EventEmitter();
  // eventEmiter.emit("test");
  // nodemailer.createTestAccount((err, account) => {
  //   if (err) {
  //     console.error("Failed to create a testing account. " + err.message);
  //     return process.exit(1);
  //   }
  //   // Create a SMTP transporter object
  //   let transporter = nodemailer.createTransport({
  //     host: account.smtp.host,
  //     port: account.smtp.port,
  //     secure: account.smtp.secure,
  //     auth: {
  //       user: account.user,
  //       pass: account.pass,
  //     },
  //   });
  //   // Message object
  //   let message = {
  //     from: "<sender@example.com>",
  //     to: "<recipient@example.com>",
  //     subject: "Nodemailer is unicode friendly ✔",
  //     text: "Hello to myself!",
  //     html: "<p><b>Hello</b> to myself!</p>",
  //   };
  //   transporter.sendMail(message, (err, info) => {
  //     if (err) {
  //       console.log("Error occurred. " + err.message);
  //       return process.exit(1);
  //     }
  //   });
  // });
});

app.post("/observatory-api/data/test", async (req, res) => {
  const data = await connection("observatory_entries")
    .where({
      type: "request",
    })
    .limit(20)
    .offset(0)
    .orderBy("created_at", "desc");

  return res.status(200).json(data);
});

const PORT = 9999;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
