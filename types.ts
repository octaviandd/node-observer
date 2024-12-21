/** @format */
import { Request, Response, NextFunction } from "express";
import { MongoClient } from "mongodb";
import { Connection as MySql2Connection } from "mysql2/promise";
import { Connection as MySqlConnection } from "mysql";
import { Client } from "pg";
import { RedisClientType } from "redis";
import { Knex } from "knex";

export type Logger = "winston" | "pino" | "bunyan";
export type Scheduler = "node-schedule";
export type Mailer = "nodemailer" | "sendgrid";
export type Cache = "redis" | "ioredis" | "node-cache" | "lru-cache";
export type Notifications = "pusher";
export type Requests = "express";
export type Http = "axios" | "http" | "https" | "fetch";
export type Jobs = "bull" | "agenda";
export type Errors = "uncaught" | "unhandled";
// what to do with database logging for queries.

export interface Config {
  packages: {
    errors?: Errors[];
    jobs?: Jobs[];
    requests?: Requests[];
    http?: Http[];
    logging?: Array<{
      name: Logger;
      connection: {} | Function;
    }>;
    database?: Array<{
      name: StoreDriver;
      connection: {} | Function;
    }>;

    scheduler?: Array<{
      name: Scheduler;
      connection: {} | Function;
    }>;
    mailer?: Array<{
      name: Mailer;
      connection: {} | Function;
    }>;
    cache?: Array<{
      name: Cache;
      connection: {} | Function;
    }>;
    notifications?: Array<{
      name: Notifications;
      connection: {} | Function;
    }>;
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
  | MySql2Connection
  | Knex
  | Promise<MySql2Connection>;

export type StoreDriver =
  | "redis"
  | "mysql"
  | "mysql2"
  | "mongodb"
  | "postgres"
  | "knex";
