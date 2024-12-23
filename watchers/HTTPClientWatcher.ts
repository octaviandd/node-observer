/** @format */

import { MongoClient } from "mongodb";
import { Client as PgClient } from "pg";
import { RedisClientType } from "redis";
import type { Connection as MySqlConnection } from "mysql";
import type { Connection as MySql2Connection } from "mysql2/promise";
import { Request, Response } from "express";
import { StoreConnection, StoreDriver } from "../types";
import { v4 as uuidv4 } from "uuid";
import Watcher from "./Watcher";

class HTTPClientWatcher implements Watcher {
  type = "http";
  private storeDriver: StoreDriver;
  private storeConnection: StoreConnection;

  constructor(storeDriver: StoreDriver, storeConnection: StoreConnection) {
    this.storeDriver = storeDriver;
    this.storeConnection = storeConnection;
  }

  public async addContent(content: any): Promise<void> {
    const newEntry = {
      uuid: uuidv4(),
      batch_id: uuidv4(),
      family_hash: uuidv4(),
      type: this.type,
      content: JSON.stringify(content),
    };

    await this.handleContent(newEntry, "add");
  }

  private async handleContent(
    entry: any,
    action: "add" | "view" | "index",
    id?: string
  ): Promise<any> {
    const queries = {
      knex: {
        add: () =>
          (this.storeConnection as any)("observatory_entries").insert(entry),
        view: () =>
          (this.storeConnection as any)("observatory_entries")
            .where({ uuid: id })
            .first(),
        index: () =>
          (this.storeConnection as any)("observatory_entries")
            .where({ type: "http" })
            .orWhere({ type: "https" })
            .orderBy("created_at", "desc"),
      },
      mysql: {
        add: () =>
          (this.storeConnection as MySqlConnection).query(
            "INSERT INTO observatory_entries (uuid, batch_id, family_hash, type, content) VALUES (?, ?, ?, ?, ?)",
            [
              entry.uuid,
              entry.batch_id,
              entry.family_hash,
              entry.type,
              entry.content,
            ]
          ),
        view: () =>
          (this.storeConnection as MySqlConnection).query(
            "SELECT * FROM observatory_entries WHERE uuid = ?",
            [id!]
          ),
        index: () =>
          (this.storeConnection as MySqlConnection).query(
            "SELECT * FROM observatory_entries WHERE type IN ('http', 'https') ORDER BY created_at DESC"
          ),
      },
      mysql2: {
        add: () =>
          (this.storeConnection as MySql2Connection).query(
            "INSERT INTO observatory_entries (uuid, batch_id, family_hash, type, content) VALUES (?, ?, ?, ?, ?)",
            [
              entry.uuid,
              entry.batch_id,
              entry.family_hash,
              entry.type,
              entry.content,
            ]
          ),
        view: () =>
          (this.storeConnection as MySql2Connection).query(
            "SELECT * FROM observatory_entries WHERE uuid = ?",
            [id!]
          ),
        index: () =>
          (this.storeConnection as MySql2Connection).query(
            "SELECT * FROM observatory_entries WHERE type IN ('http', 'https') ORDER BY created_at DESC"
          ),
      },
      postgres: {
        add: () =>
          (this.storeConnection as PgClient).query(
            "INSERT INTO observatory_entries (uuid, batch_id, family_hash, type, content) VALUES ($1, $2, $3, $4, $5)",
            [
              entry.uuid,
              entry.batch_id,
              entry.family_hash,
              entry.type,
              entry.content,
            ]
          ),
        view: () =>
          (this.storeConnection as PgClient).query(
            "SELECT * FROM observatory_entries WHERE uuid = $1",
            [id!]
          ),
        index: () =>
          (this.storeConnection as PgClient).query(
            "SELECT * FROM observatory_entries WHERE type IN ('http', 'https') ORDER BY created_at DESC"
          ),
      },
      redis: {
        add: () =>
          (this.storeConnection as RedisClientType).set(
            entry.uuid,
            JSON.stringify(entry)
          ),
        view: async () =>
          (this.storeConnection as RedisClientType)
            .get(id!)
            .then((data) => (data ? JSON.parse(data) : null)),
        index: async () => {
          const keys = await (this.storeConnection as RedisClientType).keys(
            "*"
          );
          const entries = [];
          for (const key of keys) {
            const val = await (this.storeConnection as RedisClientType).get(
              key
            );
            if (val) {
              const parsed = JSON.parse(val);
              if (parsed.type === "http" || parsed.type === "https") {
                entries.push(parsed);
              }
            }
          }
          return entries;
        },
      },
      mongodb: {
        add: () =>
          (this.storeConnection as MongoClient)
            .db()
            .collection("observatory_entries")
            .insertOne(entry),
        view: () =>
          (this.storeConnection as MongoClient)
            .db()
            .collection("observatory_entries")
            .findOne({ uuid: id }),
        index: () =>
          (this.storeConnection as MongoClient)
            .db()
            .collection("observatory_entries")
            .find({ type: { $in: ["http", "https"] } })
            .sort({ created_at: -1 })
            .toArray(),
      },
    };
    return (await queries[this.storeDriver]?.[action]?.()) as any;
  }

  public async getIndex(req: Request, res: Response) {
    try {
      const data = await this.handleContent(null, "index");
      return res.status(200).json(data);
    } catch (error) {
      console.error("Error getting index from HTTPClientWatcher", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  public async getView(req: Request, res: Response) {
    try {
      const data = await this.handleContent(null, "view", req.params.httpId);
      return res.status(200).json(data);
    } catch (error) {
      console.error("Error getting view from HTTPClientWatcher", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

export default HTTPClientWatcher;