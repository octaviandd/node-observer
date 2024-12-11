/** @format */

import Watcher from "./Watcher";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";

class ScheduleWatcher implements Watcher {
  type = "schedule";
  constructor(private connection: any) {}

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
    return this.connection("observatory_entries")
      [action === "add" ? "insert" : action === "view" ? "where" : "orderBy"](
        action === "add" ? entry : action === "view" ? { uuid: id } : "created_at",
        action === "index" ? "desc" : undefined
      )
      .first();
  }

  async getIndex(req: Request, res: Response) {
    try {
      const data = await this.handleContent(null, "index");
      return res.status(200).json(data);
    } catch (error) {
      console.error("Error getting index from ScheduleWatcher", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async getView(req: Request, res: Response) {
    try {
      const data = await this.handleContent(null, "view", req.params.scheduleId);
      return res.status(200).json(data);
    } catch (error) {
      console.error("Error getting view from ScheduleWatcher", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

export default ScheduleWatcher;
