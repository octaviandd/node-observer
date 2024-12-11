/** @format */

import Watcher from "./Watcher";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";

class NotificationWatcher implements Watcher {
  type: string;
  private connection: any;

  constructor(connection: any) {
    this.type = "notification";
    this.connection = connection;
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
    this.handleContent(newEntry, "add");
  }

  handleContent(entry: any, action: "add" | "view" | "index", id?: string) {
    const queries = {
      add: () => this.connection("observatory_entries").insert(entry),
      view: () => this.connection("observatory_entries").where({ uuid: id }).first(),
      index: () => this.connection("observatory_entries").where({ type: "notification" }).orderBy("created_at", "desc"),
    };
    return queries[action]?.();
  }

  public async getIndex(req: Request, res: Response) {
    try {
      const data = await this.handleContent(null, "index");
      return res.status(200).json(data);
    } catch (error) {
      console.error("Error getting index from NotificationWatcher", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  public async getView(req: Request, res: Response) {
    try {
      const data = await this.handleContent(null, "view", req.params.notificationId);
      return res.status(200).json(data);
    } catch (error) {
      console.error("Error getting view from NotificationWatcher", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

export default NotificationWatcher;
