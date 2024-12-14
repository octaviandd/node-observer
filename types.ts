/** @format */
import { Request, Response, NextFunction } from "express";
import { MongoClient } from "mongodb";
import { Connection as MySql2Connection } from "mysql2/promise";
import { Connection as MySqlConnection } from "mysql";
import { Client } from "pg";
import { RedisClientType } from "redis";

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

export interface config {
  database: "redis" | "mongodb" | "postgres" | "mysql";
  packages: {
    errors: Errors[];
    logging?: {
      name: Logger[];
      connection: {} | Function;
    };
    database?: {
      name: Database[];
      connection: {} | Function;
    };
    jobs?: Jobs[];
    scheduler?: {
      name: Scheduler[];
      connection: {} | Function;
    };
    mailer?: {
      name: Mailer[];
      connection: {} | Function;
    };
    cache?: {
      name: Cache[];
      connection: {} | Function;
    };
    notifications?: {
      name: Notifications[];
      connection: {} | Function;
    };
    requests?: Requests[];
    http?: Http[];
  };
}

export type LoggerType =
  | "event"
  | "job"
  | "exception"
  | "notification"
  | "query"
  | "mail"
  | "cache"
  | "redis"
  | "request";

export type MiddleWareParams<T extends LoggerType> = T extends "request"
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

export type StoreConnection =
  | MongoClient
  | Client
  | RedisClientType
  | MySqlConnection
  | MySql2Connection;

export type StoreDriver = "redis" | "mysql" | "mysql2" | "mongodb" | "postgres";
