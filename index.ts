/** @format */

import setupLogger from "./lib/logger";
import { runMigration, rollbackMigration } from "./database/migrate";
import { config } from "./types";
import { ConnectionType, ConnectionDriver } from "./types";

export async function startObservatory(
  config: config,
  driver: ConnectionDriver,
  connection: ConnectionType,
  callback: Function
) {
  // runMigration();
  await setupLogger(config, driver, connection);
  console.log("Observatory started with config:", config);
  callback();
}

export default { startObservatory, rollbackMigration, runMigration };
