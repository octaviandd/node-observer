/** @format */
import "./logger";
import express from "express";
import routes from "./routes/routes";
import cors from "cors";
// import { createClient, RedisClientType } from "redis";
// import mysql from "mysql";
import * as mysql2 from "mysql2/promise";
// import winston from "winston";
import { Config } from "./types";
// import pino from "pino";
// import bunyan from "bunyan";
// import log4js from "log4js";
// import cron from "node-cron";
// import scheduler from "node-schedule";
// import mailer from "nodemailer";

// const logger = winston.createLogger({
//   level: "info",
//   format: winston.format.json(),
//   defaultMeta: { service: "user-service" },
//   transports: [
//     new winston.transports.File({ filename: "error.log", level: "error" }),
//     new winston.transports.File({ filename: "combined.log" }),
//   ],
// });
// const bunyanLogger = bunyan.createLogger({
//   name: "myapp",
// });
// const log4jsLogger = log4js.getLogger();
// const pinoLogger = pino();

// const redisConnection: RedisClientType = createClient({
//   url: "redis://localhost:6379",
// });

// const transporter = mailer.createTransport({
//   host: "smtp.ethereal.email",
//   port: 587,
//   secure: false, // true for port 465, false for other ports
//   auth: {
//     user: "maddison53@ethereal.email",
//     pass: "jn7jnAPss4f63QBp6D",
//   },
// });
// const mysqlConnection = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "root",
//   database: "observatory",
// });

const mysql2Connection = mysql2.createConnection({
  host: "localhost",
  user: "root",
  password: "Database.123",
  database: "observatory",
});

const config: Config = {
  packages: {
    requests: "express",
    // logging: [
    //   {
    //     name: "winston",
    //     connection: logger,
    //   },
    //   {
    //     name: "pino",
    //     connection: pinoLogger,
    //   },
    //   {
    //     name: "bunyan",
    //     connection: bunyanLogger,
    //   },
    //   {
    //     name: "log4js",
    //     connection: log4jsLogger,
    //   },
    // ],
    // scheduler: [
    //   {
    //     name: "node-cron",
    //     connection: cron,
    //   },
    //   {
    //     name: "node-schedule",
    //     connection: scheduler,
    //   },
    // ],
  },
};

// async function init() {
//   await setupLogger(config, "mysql2", mysql2Connection);
// }

// setupLogger(config, "mysql2", mysql2Connection);

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use("/observatory-api/data", routes);

// app.get("/test", (req, res) => {
//   res.send("Hello world");
// });
// API routes
app.get("/", async (req, res) => {
  res.status(200).json({ message: "Welcome to the observatory API" });
  // logger.error("Welcome to the observatory API");
  // pinoLogger.info("Welcome to the observatory API : PINO");
  // bunyanLogger.info("Welcome to the observatory API : BUNYAN");
  // log4jsLogger.info("Welcome to the observatory API : LOG4JS");

  // const info = await transporter.sendMail({
  //   from: '"Maddison Foo Koch 👻" <maddison53@ethereal.email>', // sender address
  //   to: "bar@example.com, baz@example.com", // list of receivers
  //   subject: "Hello ✔", // Subject line
  //   text: "Hello world?", // plain text body
  //   html: "<b>Hello world?</b>", // html body
  // });

  // cron.schedule("*/1 * * * *", () => {
  //   console.log("running a task every minute");
  // });

  // scheduler.scheduleJob("*/1 * * * *", () => {
  //   console.log("running a task every minute");
  // });
});

const PORT = 9999;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

