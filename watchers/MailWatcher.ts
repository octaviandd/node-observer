/** @format */

import connection from "../database/connection";
import Watcher from "../core/Watcher";
import { v4 as uuidv4 } from "uuid";
import { Response, Request } from "express";

class MailWatcher implements Watcher {
  type: string;

  constructor() {
    this.type = "mail";
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
      console.error("Error adding content to MailWatcher", error);
    }
  }

  public async getIndex(req: Request, res: Response): Promise<Response> {
    try {
      const data = await connection("observatory_entries").where({
        type: "mail",
      });
      return res.status(200).json(data);
    } catch (error) {
      console.error("Error getting index from MailWatcher", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  public async getView(req: Request, res: Response): Promise<Response> {
    try {
      const data = await connection("observatory_entries")
        .where({ uuid: req.params.mailId })
        .first();
      return res.status(200).json(data);
    } catch (error) {
      console.error("Error getting view from MailWatcher", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

export default MailWatcher;
