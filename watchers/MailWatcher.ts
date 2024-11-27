/** @format */

import connection from "../database/connection";
import Watcher from "../core/Watcher";
import { v4 as uuidv4 } from "uuid";
import { Response, Request } from "express";

const MailWatcher = Object.create(Watcher);

MailWatcher.type = "mail";
MailWatcher.should_display_on_index = true;
MailWatcher.content = {};

MailWatcher.addContent = async function (content: any) {
  const newEntry = {
    uuid: uuidv4(),
    batch_id: uuidv4(),
    family_hash: uuidv4(),
    type: "mail",
    should_display_on_index: true,
    content: JSON.stringify(content),
  };

  try {
    const result = await connection("observatory_entries").insert(newEntry);
    return result;
  } catch (error) {
    console.error("Error adding content to MailWatcher", error);
  }
};

MailWatcher.getIndex = async (req: Request, res: Response) => {
  try {
    let data = await connection("observatory_entries")
      .where({
        type: "mail",
      })
      .orderBy("created_at", "desc");
    return res.status(200).json(data);
  } catch (e) {
    console.error(e);
  }
};

MailWatcher.getView = async (req: Request, res: Response) => {
  console.log(req.params);
  try {
    let data = await connection("observatory_entries")
      .where({
        uuid: req.params.mailId,
      })
      .first();
    console.log(data);
    return res.status(200).json(data);
  } catch (e) {
    console.error(e);
  }
};

export default MailWatcher;
