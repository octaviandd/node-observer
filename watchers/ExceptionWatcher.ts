/** @format */

import connection from "../database/connection";
import Watcher from "../core/Watcher";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";

const ExceptionWatcher = Object.create(Watcher);

ExceptionWatcher.type = "exception";
ExceptionWatcher.should_display_on_index = true;
ExceptionWatcher.content = {};

ExceptionWatcher.addContent = async function (content: any) {
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
    console.error("Error adding content to ExceptionWatcher", error);
  }
};

ExceptionWatcher.getIndex = async (req: Request, res: Response) => {
  try {
    let data = await connection("observatory_entries")
      .where({
        type: "exception",
      })
      .orderBy("created_at", "desc");
    return res.status(200).json(data);
  } catch (e) {
    console.error(e);
  }
};

ExceptionWatcher.getView = async (req: Request, res: Response) => {
  try {
    let data = await connection("observatory_entries")
      .where({
        uuid: req.params.exceptionId,
      })
      .first();
    return res.status(200).json(data);
  } catch (e) {
    console.error(e);
  }
};

export default ExceptionWatcher;
