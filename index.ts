/** @format */

import loadConfig from "./config-loader";
import setupLogger from "./lib/logger";
import { runMigration, rollbackMigration } from "./database/migrate";

function startObservatory(customConfigPath: string, databaseConnection: any) {
  // Run migrations first
  const config = loadConfig(customConfigPath);
  const logger = setupLogger(config, databaseConnection);

  console.log("Observatory started with config:", config);
}

export default startObservatory;
