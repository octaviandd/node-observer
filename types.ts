/** @format */
import { Request, Response, NextFunction } from "express";

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
