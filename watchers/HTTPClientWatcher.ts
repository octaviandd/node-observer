/** @format */

import connection from "../database/connection";
import Watcher from "../core/Watcher";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";

const HTTPClientWatcher = Object.create(Watcher);

HTTPClientWatcher.type = "http";
HTTPClientWatcher.should_display_on_index = true;
HTTPClientWatcher.content = {};

HTTPClientWatcher.addContent = async function (content: any) {
  const newEntry = {
    uuid: uuidv4(),
    batch_id: uuidv4(),
    family_hash: uuidv4(),
    type: "http",
    should_display_on_index: true,
    content: JSON.stringify(content),
  };

  try {
    const result = await connection("observatory_entries").insert(newEntry);
    return result;
  } catch (error) {
    console.error("Error adding content to HTTPClientWatcher", error);
  }
};

HTTPClientWatcher.getIndex = async (req: Request, res: Response) => {
  try {
    let data = await connection("observatory_entries")
      .whereIn("type", ["http", "https"])
      .orderBy("created_at", "desc");
    return res.status(200).json(data);
  } catch (e) {
    console.error(e);
  }
};

HTTPClientWatcher.getView = async (req: Request, res: Response) => {
  try {
    let data = await connection("observatory_entries")
      .where({
        uuid: req.params.requestId,
      })
      .first();
    return res.status(200).json(data);
  } catch (e) {
    console.error(e);
  }
};

export default HTTPClientWatcher;
