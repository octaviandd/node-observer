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
import connection from "./database/connection";

globalCollector("pusher", { log: true }, (pkg: any) => {
  console.log("package has been collected");
});
globalCollector("nodemailer", { log: true }, (pkg: any) => {
  console.log("package has been collected");
});
globalCollector("express", { log: true }, (pkg: any) => {
  console.log("package has been collected");
});
globalCollector("node-schedule", { log: true }, (pkg: any) => {
  console.log("package has been collected");
});
globalCollector("node-cache", { log: true }, (pkg: any) => {
  console.log("node-cache has been collected");
});
globalCollector("ioredis", { log: true }, (pkg: any) => {
  console.log("ioredis setup");
});
globalCollector("commander", { log: true }, (pkg: any) => {
  console.log("commander setup");
});
globalCollector("knex", { log: true }, (pkg: any) => {
  console.log("knex setup");
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
app.use(express.urlencoded({ extended: true }));
// app.use(requestLogger);

app.use("/api", routes);

const event = new EventEmitter();

// API routes
app.get("/", async (req, res) => {
  res.send("Hello World");

  myCache.set("test", "test");
  redis.set("test", "test");
  redis.get("test");

  await connection("observatory_entries")
    .where("uuid", "0646d629-a122-40f2-b495-d7ee7e8cf4ca")
    .first();
  // withObserver("redis", { key: "mykey", value: "value" }, () =>
  //   redis.set("mykey", "value")
  // );

  // withObserver("event", { eventName: "test", props: { userId: 1 } }, () =>
  //   event.emit("test")
  // );
  // schedule.scheduleJob("34 * * * *", function () {
  //   console.log("The answer to life, the universe, and everything!");
  // });

  // withObserver("exception", { error: new Error("error") }, () => {
  //   throw new Error("error");
  // });

  // pusher.trigger("my-channel", "my-event", {
  //   message: "hello world",
  // });

  // const eventEmiter = new EventEmitter();
  // eventEmiter.emit("test");

  // withObserver("cache", { key: " ", value: " " }, () => {
  //   myCache.set("myKey", "myValue");
  // });

  // nodemailer.createTestAccount((err, account) => {
  //   if (err) {
  //     console.error("Failed to create a testing account. " + err.message);
  //     return process.exit(1);
  //   }

  //   console.log("Credentials obtained, sending message...");

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
  //     from: "Sender Name <sender@example.com>",
  //     to: "Recipient <recipient@example.com>",
  //     subject: "Nodemailer is unicode friendly ✔",
  //     text: "Hello to myself!",
  //     html: "<p><b>Hello</b> to myself!</p>",
  //   };

  //   transporter.sendMail(message, (err, info) => {
  //     if (err) {
  //       console.log("Error occurred. " + err.message);
  //       return process.exit(1);
  //     }

  //     console.log("Message sent: %s", info.messageId);
  //     // Preview only available when sending through an Ethereal account
  //     console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  //   });
  // });
});

app.use((req, res, next) => {
  console.log("next");
  next();
});

const PORT = 9999;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// runMigration().catch((err) => {
//   console.error(err);
//   process.exit(1);
// });

// rollbackMigration().catch((err) => {
//   console.error(err);
//   process.exit(1);
// })

export default app;
