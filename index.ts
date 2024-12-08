/** @format */

import loadConfig from "./config-loader";
import setupLogger from "./lib/logger";

function startObservatory(customConfigPath: string) {
  const config = loadConfig(customConfigPath);
  const logger = setupLogger();

  console.log("Observatory started with config:", config);
}

export default startObservatory;
