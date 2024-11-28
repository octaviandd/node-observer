/** @format */

import connection from "../database/connection";
import Watcher from "../core/Watcher";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";

const NotificationWatcher = Object.create(Watcher);

NotificationWatcher.type = "notification";
NotificationWatcher.should_display_on_index = true;
NotificationWatcher.content = {};

NotificationWatcher.addContent = async function (content: any) {
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
    return result;
  } catch (error) {
    console.error("Error adding content to NotificationWatcher", error);
  }
};

NotificationWatcher.getIndex = async (req: Request, res: Response) => {
  try {
    let data = await connection("observatory_entries")
      .where({
        type: "notification",
      })
      .orderBy("created_at", "desc");
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error getting index for NotificationWatcher", error);
  }
};

NotificationWatcher.getView = async (req: Request, res: Response) => {
  try {
    let data = await connection("observatory_entries")
      .where({
        uuid: req.params.notificationId,
      })
      .first();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error getting view for NotificationWatcher", error);
  }
};

export default NotificationWatcher;
