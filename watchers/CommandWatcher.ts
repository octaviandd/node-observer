/** @format */

import connection from "../database/connection";
import Watcher from "./Watcher";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";

class CommandWatcher implements Watcher {
  type: string;

  constructor() {
    this.type = "command";
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
      await connection("observatory_entries").insert(newEntry);
    } catch (error) {
      console.error("Error adding content to CommandWatcher", error);
    }
  }

  public async getIndex(req: Request, res: Response) {
    try {
      const data = await connection("observatory_entries")
        .where({
          type: "command",
        })
        .orderBy("created_at", "desc");
      return res.status(200).json(data);
    } catch (error) {
      console.error("Error getting index from CommandWatcher", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  public async getView(req: Request, res: Response) {
    try {
      const data = await connection("observatory_entries")
        .where({ uuid: req.params.commandId })
        .first();
      return res.status(200).json(data);
    } catch (error) {
      console.error("Error getting view from CommandWatcher", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

export default CommandWatcher;
