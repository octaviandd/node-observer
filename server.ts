/** @format */

import express from "express";
import { runMigration, rollbackMigration } from "./database/migrate";
import { requestLogger } from "./middleware/requestLogger";
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
import Agenda from "agenda";
import os from "os";

globalCollector("exception", { log: true }, (pkg: any) => {});
globalCollector("pusher", { log: true }, (pkg: any) => {});
globalCollector("nodemailer", { log: true }, (pkg: any) => {});
globalCollector("express", { log: true }, (pkg: any) => {});
globalCollector("node-schedule", { log: true }, (pkg: any) => {});
globalCollector("node-cache", { log: true }, (pkg: any) => {});
globalCollector("ioredis", { log: true }, (pkg: any) => {});
globalCollector("commander", { log: true }, (pkg: any) => {});
globalCollector("knex", { log: true, connection }, (pkg: any) => {});
globalCollector("mysql2", { log: true, connection }, (pkg: any) => {});
globalCollector("events", { log: true }, (pkg: any) => {});
globalCollector("http", { log: true }, (pkg: any) => {});
globalCollector("https", { log: true }, (pkg: any) => {});
globalCollector("winston", { log: true }, (pkg: any) => {});
globalCollector("bull", { log: true }, (pkg: any) => {});
globalCollector("agenda", { log: true }, (pkg: any) => {});

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

const pusher = new Pusher({
  appId: "1900516",
  key: "388f3d0fd14c5d061f26",
  secret: "88f15826546ec27aa46d",
  cluster: "eu",
  useTLS: true,
});

const myCache = new NodeCache({ stdTTL: 100, checkperiod: 120 });

const redis = new Redis({
  port: 6379, // Redis port
  host: "127.0.0.1", // Redis host
  db: 0, // Optional database index
});

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

console.log(os.cpus());
console.log(os.totalmem());
console.log(os.freemem());

app.use("/observatory-api/data", routes);

// API routes
app.get("/", async (req, res) => {
  // logger.info("Hello World");
  // logger.warn("Warning");
  // https
  //   .get("https://jsonplaceholder.typicode.com/todos/1", (resp) => {
  //     resp.on("data", () => {});
  //     resp.on("end", () => {});
  //   })
  //   .on("error", (err) => {});
  // res.send("Hello World");
  // myCache.set("test", "test");
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
  // schedule.cancelJob("life-universe-everything");
  // pusher.trigger("my-channel", "my-event", {
  //   message: "hello world",
  // });
  // // setTimeout(() => {
  // //   throw new Error("This is an uncaught exception!");
  // // }, 1000);
  // let data = await connection("migrations");
  // console.log(data);
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

const PORT = 9999;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
