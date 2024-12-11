/** @format */

import Watcher from "./Watcher";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";

type ConnectionType = "mysql" | "postgres" | "redis" | "mongodb";

class JobWatcher implements Watcher {
  type = "job";
  private connectionType: ConnectionType;
  constructor(connectionType: ConnectionType, private connection: any) {
    this.connectionType = connectionType;
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
    this.handleContent(entry, "add");
  }

  handleContent(entry: any, action: "add" | "view" | "index", id?: string) {
    const queries = {
      mysql: {
        add: () =>
          this.connection.query(
            "INSERT INTO observatory_entries (uuid, batch_id, family_hash, type, should_display_on_index, content) VALUES (?, ?, ?, ?, ?, ?)",
            [entry.uuid, entry.batch_id, entry.family_hash, entry.type, entry.should_display_on_index, entry.content]
          ),
        view: () =>
          this.connection.query("SELECT * FROM observatory_entries WHERE uuid = ?", [id]),
        index: () =>
          this.connection.query("SELECT * FROM observatory_entries WHERE type = 'job' ORDER BY created_at DESC"),
      },
      postgres: {
        add: () =>
          this.connection.query(
            "INSERT INTO observatory_entries (uuid, batch_id, family_hash, type, should_display_on_index, content) VALUES ($1, $2, $3, $4, $5, $6)",
            [entry.uuid, entry.batch_id, entry.family_hash, entry.type, entry.should_display_on_index, entry.content]
          ),
        view: () =>
          this.connection.query("SELECT * FROM observatory_entries WHERE uuid = $1", [id]),
        index: () =>
          this.connection.query("SELECT * FROM observatory_entries WHERE type = 'job' ORDER BY created_at DESC"),
      },
      redis: {
        add: () => this.connection.set(entry.uuid, JSON.stringify(entry)),
        view: () => this.connection.get(id),
        index: () => this.connection.keys("*"),
      },
      mongodb: {
        add: () => this.connection.collection("observatory_entries").insertOne(entry),
        view: () =>
          this.connection.collection("observatory_entries").findOne({ uuid: id }),
        index: () =>
          this.connection
            .collection("observatory_entries")
            .find({ type: "job" })
            .sort({ created_at: -1 })
            .toArray(),
      },
    };
    return queries[this.connectionType]?.[action]?.();
  }

  async getIndex(req: Request, res: Response): Promise<Response> {
    try {
      const data = await this.handleContent(null, "index");
      return res.status(200).json(data);
    } catch {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async getView(req: Request, res: Response): Promise<Response> {
    try {
      const data = await this.handleContent(null, "view", req.params.jobId);
      return res.status(200).json(data);
    } catch {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

export default JobWatcher;
