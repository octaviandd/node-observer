/** @format */

import connection from "../database/connection";
import Watcher from "../core/Watcher";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";

class HTTPClientWatcher implements Watcher {
  type: string;

  constructor() {
    this.type = "http";
  }

  public async addContent(content: any): Promise<void> {
    const newEntry = {
      uuid: uuidv4(),
      batch_id: uuidv4(),
      family_hash: uuidv4(),
      type: this.type,
      content: JSON.stringify(content),
    };

    try {
      await connection("observatory_entries").insert(newEntry);
    } catch (error) {
      console.error("Error adding content to HTTPClientWatcher", error);
    }
  }

  public async getIndex(req: Request, res: Response) {
    try {
      const data = await connection("observatory_entries")
        .where({
          type: "[http, https]",
        })
        .orderBy("created_at", "desc");
      return res.status(200).json(data);
    } catch (error) {
      console.error("Error getting index from HTTPClientWatcher", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  public async getView(req: Request, res: Response) {
    try {
      const data = await connection("observatory_entries")
        .where({ uuid: req.params.requestId })
        .first();
      return res.status(200).json(data);
    } catch (error) {
      console.error("Error getting view from HTTPClientWatcher", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

export default HTTPClientWatcher;