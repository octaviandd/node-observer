/** @format */

import Watcher from "./Watcher";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";

class QueryWatcher implements Watcher {
  type: string;
  private connection: any;

  constructor(connection: any) {
    this.type = "query";
    this.connection = connection;
  }

  public async addContent(content: unknown): Promise<void> {
    const newEntry = {
      uuid: uuidv4(),
      batch_id: uuidv4(),
      family_hash: uuidv4(),
      type: this.type,
      should_display_on_index: true,
      content: JSON.stringify(content),
    };
    this.handleContent(newEntry, "add");
  }

  handleContent(entry: any, action: "add" | "view" | "index", id?: string) {
    const queries = {
      add: () => this.connection("observatory_entries").insert(entry),
      view: () => this.connection("observatory_entries").where({ uuid: id }).first(),
      index: () => this.connection("observatory_entries").where({ type: "query" }).orderBy("created_at", "desc"),
    };
    return queries[action]?.();
  }

  public async getIndex(req: Request, res: Response) {
    try {
      const data = await this.handleContent(null, "index");
      return res.status(200).json(data);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  public async getView(req: Request, res: Response) {
    try {
      const data = await this.handleContent(null, "view", req.params.queryId);
      return res.status(200).json(data);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

export default QueryWatcher;
