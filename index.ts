/** @format */

import setupLogger from "./lib/logger";
import { config } from "./types";
import { StoreConnection, StoreDriver } from "./types";

export async function startObservatory(
  config: config,
  driver: StoreDriver,
  connection: StoreConnection,
  callback: Function
) {
  // runMigration();
  await setupLogger(config, driver, connection);
  console.log("Observatory started with config:", config);
  callback();
}

export default { startObservatory };
