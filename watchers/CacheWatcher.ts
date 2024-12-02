/** @format */

import connection from "../database/connection";
import Watcher from "../core/Watcher";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";

class CacheWatcher implements Watcher {
  type: string;

  constructor() {
    this.type = "cache";
  }

  public async addContent(content: any): Promise<void> {
    const newEntry = {
      uuid: uuidv4(),
      batch_id: uuidv4(),
      family_hash: uuidv4(),
      type: this.type,
      should_display_on_index: true,
      content: JSON.stringify(content),
    };

    try {
      await connection("observatory_entries").insert(newEntry);
    } catch (error) {
      console.error("Error adding content to CacheWatcher", error);
    }
  }

  public async getIndex(req: Request, res: Response) {
    try {
      const data = await connection("observatory_entries")
        .where({
          type: "cache",
        })
        .orderBy("created_at", "desc");
      return res.status(200).json(data);
    } catch (error) {
      console.error("Error getting index from CacheWatcher", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  public async getView(req: Request, res: Response) {
    try {
      const data = await connection("observatory_entries")
        .where({ uuid: req.params.cacheId })
        .first();
      return res.status(200).json(data);
    } catch (error) {
      console.error("Error getting view from CacheWatcher", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

export default CacheWatcher;
