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

class RequestWatcher implements Watcher {
  private storeDriver: StoreDriver;
  private storeConnection: StoreConnection;
  type = "request";

  constructor(storeDriver: StoreDriver, storeConnection: StoreConnection) {
    this.storeDriver = storeDriver;
    this.storeConnection = storeConnection;

    if (this.storeConnection instanceof Promise) {
      this.storeConnection.then((connection) => {
        this.storeConnection = connection;
      });
    }
  }

  async addContent(content: any): Promise<void> {
    const entry = {
      uuid: uuidv4(),
      batch_id: uuidv4(),
      family_hash: uuidv4(),
      type: this.type,
      should_display_on_index: true,
      content: JSON.stringify(content),
    };
    await this.handleContent(entry, "add");
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
            .where({ type: "request" })
            .orderBy("created_at", "desc"),
      },
      mysql: {
        add: () =>
          (this.storeConnection as MySqlConnection).query(
            "INSERT INTO observatory_entries (uuid, batch_id, family_hash, type, should_display_on_index, content) VALUES (?, ?, ?, ?, ?, ?)",
            [
              entry.uuid,
              entry.batch_id,
              entry.family_hash,
              entry.type,
              entry.should_display_on_index,
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
            "SELECT * FROM observatory_entries WHERE type = 'request' ORDER BY created_at DESC"
          ),
      },
      mysql2: {
        add: async () => {
          console.log("hit mysql2");
          try {
            const [results] = await (
              this.storeConnection as MySql2Connection
            ).query(
              "INSERT INTO observatory_entries (uuid, batch_id, family_hash, type, should_display_on_index, content) VALUES (?, ?, ?, ?, ?, ?)",
              [
                entry.uuid,
                entry.batch_id,
                entry.family_hash,
                entry.type,
                entry.should_display_on_index,
                entry.content,
              ]
            );
            return results;
          } catch (error) {
            console.error(error);
          }
        },

        view: async () => {
          try {
            const [results] = await (
              this.storeConnection as MySql2Connection
            ).query("SELECT * FROM observatory_entries WHERE uuid = ?", [id!]);
            return results;
          } catch (error) {}
        },

        index: async () => {
          try {
            const [results] = await (
              this.storeConnection as MySql2Connection
            ).query(
              "SELECT * FROM observatory_entries WHERE type = 'request' ORDER BY created_at DESC"
            );
            return results;
          } catch (error) {
            console.error(error);
          }
        },
      },
      postgres: {
        add: () =>
          (this.storeConnection as PgClient).query(
            "INSERT INTO observatory_entries (uuid, batch_id, family_hash, type, should_display_on_index, content) VALUES ($1, $2, $3, $4, $5, $6)",
            [
              entry.uuid,
              entry.batch_id,
              entry.family_hash,
              entry.type,
              entry.should_display_on_index,
              entry.content,
            ]
          ),
        view: () =>
          (this.storeConnection as PgClient).query(
            "SELECT * FROM observatory_entries WHERE uuid = $1",
            [id!]
          ),
        index: async () =>
          (this.storeConnection as PgClient).query(
            "SELECT * FROM observatory_entries WHERE type = 'request' ORDER BY created_at DESC"
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
              if (parsed.type === "request") {
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
            .db() // adjust db name if needed
            .collection("observatory_entries")
            .insertOne(entry),
        view: () =>
          (this.storeConnection as MongoClient)
            .db() // adjust db name if needed
            .collection("observatory_entries")
            .findOne({ uuid: id }),
        index: () =>
          (this.storeConnection as MongoClient)
            .db() // adjust db name if needed
            .collection("observatory_entries")
            .find({ type: "request" })
            .sort({ created_at: -1 })
            .toArray(),
      },
    };

    return (await queries[this.storeDriver]?.[action]?.()) as any;
  }

  async getIndex(req: Request, res: Response): Promise<Response> {
    try {
      const data = await this.handleContent(null, "index");
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error });
    }
  }

  async getView(req: Request, res: Response): Promise<Response> {
    try {
      const data = await this.handleContent(null, "view", req.params.requestId);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error });
    }
  }
}

export default RequestWatcher;