/** @format */

import connection from "../database/connection";
import Watcher from "../core/Watcher";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";

class RedisWatcher implements Watcher {
  type: string;

  constructor() {
    this.type = "redis";
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
      console.error("Error adding content to RedisWatcher", error);
    }
  }

  public async getIndex(req: Request, res: Response) {
    try {
      let offset = 0;
      let limit = 20;
      if (req.query.offset) {
        offset = parseInt(req.query.offset as string);
      }
      const data = await connection("observatory_entries")
        .where({
          type: "redis",
        })
        .limit(limit)
        .offset(offset)
        .orderBy("created_at", "desc");
      return res.status(200).json(data);
    } catch (error) {
      console.error("Error getting index from RedisWatcher", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  public async getView(req: Request, res: Response) {
    try {
      const data = await connection("observatory_entries")
        .where({ uuid: req.params.redisRowId })
        .first();
      return res.status(200).json(data);
    } catch (error) {
      console.error("Error getting view from RedisWatcher", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

export default RedisWatcher;
