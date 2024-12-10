/** @format */

import setupLogger from "./lib/logger";
import { runMigration, rollbackMigration } from "./database/migrate";

type Database = "redis" | "mongodb" | "postgres" | "mysql";
type Logger = "winston" | "pino" | "bunyan";
type Scheduler = "node-schedule";
type Mailer = "nodemailer" | "sendgrid" | "mailgun";
type Cache = "redis" | "ioredis" | "node-cache";
type Notifications = "onesignal" | "firebase" | "pusher";
type Requests = "express";
type Http = "axios" | "http" | "https" | "fetch";
type Jobs = "bull" | "agenda";
type Errors = "uncaught" | "unhandled";

interface config {
  database: "redis" | "mongodb" | "postgres" | "mysql";
  packages: {
    errors: Errors[];
    logging?: {
      name: Logger[];
      connection: {} | Function;
    }
    database?: {
      name: Database[];
      connection: {} | Function;
    }
    jobs?: Jobs[];
    scheduler?: {
      name: Scheduler[];
      connection: {} | Function;
    }
    mailer?: {
      name: Mailer[];
      connection: {} | Function;
    }
    cache?: {
      name: Cache[];
      connection: {} | Function;
    };
    notifications?: {
      name: Notifications[];
      connection: {} | Function;
    }
    requests?: Requests[];
    http?: Http[];
  };
}


export async function startObservatory(config: config, databaseConnection: any) {
  // runMigration();
  const logger = await setupLogger(config, databaseConnection);

  console.log("Observatory started with config:", config);
}


export default {startObservatory, rollbackMigration, runMigration};
