/** @format */

import connection from "../database/connection";
import Watcher from "../core/Watcher";
import { v4 as uuidv4 } from "uuid";

const ScheduleWatcher = Object.create(Watcher);

ScheduleWatcher.type = "schedule";
ScheduleWatcher.should_display_on_index = true;
ScheduleWatcher.content = {};

ScheduleWatcher.addContent = async function (content: any) {
  const newEntry = {
    uuid: uuidv4(),
    batch_id: uuidv4(),
    family_hash: uuidv4(),
    type: "schedule",
    should_display_on_index: true,
    content: JSON.stringify(content),
  };

  try {
    const result = await connection("observatory_entries").insert(newEntry);
    return result;
  } catch (error) {
    console.error("Error adding content to ScheduleWatcher", error);
  }
};

ScheduleWatcher.getIndex = async () =>
  await connection("observatory_entries").where({ type: "schedule" });

export default ScheduleWatcher;
