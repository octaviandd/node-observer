/** @format */

import connection from "../database/connection";
import Watcher from "../core/Watcher";
import { v4 as uuidv4 } from "uuid";

const MetricWatcher = Object.create(Watcher);

MetricWatcher.type = "metric";
MetricWatcher.should_display_on_index = true;
MetricWatcher.content = {};

MetricWatcher.addContent = async function (content: any) {
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
    console.error("Error adding content to MetricWatcher", error);
  }
};

MetricWatcher.getIndex = async () =>
  await connection("observatory_entries").where({ type: "metric" });

export default MetricWatcher;
