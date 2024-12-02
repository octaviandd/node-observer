/** @format */

import connection from "../database/connection";
import Watcher from "../core/Watcher";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";

class QueryWatcher implements Watcher {
  type: string;

  constructor() {
    this.type = "query";
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

    try {
      const result = await connection("observatory_entries").insert(newEntry);
    } catch (error) {
      console.error("Error adding content to QueryWatcher", error);
    }
  }

  public async getIndex(req: Request, res: Response) {
    try {
      let data = await connection("observatory_entries")
        .where({
          type: "query",
        })
        .orderBy("created_at", "desc");
      return res.status(200).json(data);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  public async getView(req: Request, res: Response) {
    try {
      let data = await connection("observatory_entries")
        .where({
          uuid: req.params.queryId,
        })
        .first();
      return res.status(200).json(data);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

export default QueryWatcher;
