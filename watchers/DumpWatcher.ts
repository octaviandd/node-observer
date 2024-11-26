/** @format */

import connection from "../database/connection";
import Watcher from "../core/Watcher";
import { v4 as uuidv4 } from "uuid";

const DumpWatcher = Object.create(Watcher);

DumpWatcher.type = "dump";
DumpWatcher.should_display_on_index = true;
DumpWatcher.content = {};

DumpWatcher.addContent = async function (content: any) {
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
    console.error("Error adding content to DumpWatcher", error);
  }
};

DumpWatcher.getIndex = async () =>
  await connection("observatory_entries").where({ type: "dump" });

export default DumpWatcher;
