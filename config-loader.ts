/** @format */

import path from "path";
import fs from "fs";

interface config {
  database: "redis" | "mongodb" | "postgres" | "mysql";
  packages: {
    errors: ["uncaught", "unhandled"];
    logging: ["winston", "pino", "bunyan"];
    database: ["redis", "mongodb", "postgres", "mysql"];
    jobs: ["bull", "agenda"];
    scheduler: ["node-schedule"];
    mailer: ["nodemailer"];
    cache: {
      name: "redis" | "ioredis" | "node-cache";
      connection: any;
    };
    notifications: ["pusher", "onesignal"];
    requests: ["express"];
    http: ["axios", "http", "https", "fetch"];
  };
}

/**
 * Load configuration from the user's home directory or a custom path.
 * @param {string} customPath - Optional custom path to the config file.
 * @returns {object} Parsed configuration object.
 */
function loadConfig(customPath: string): config {
  const defaultConfigPath = path.join(
    process.env.HOME || "",
    "observatory.config.js"
  );
  const configPath = customPath || defaultConfigPath;

  if (!fs.existsSync(configPath)) {
    throw new Error(`Config file not found at ${configPath}`);
  }

  try {
    const config = require(configPath);
    return config;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error loading config file: ${error.message}`);
    } else {
      throw new Error("Error loading config file");
    }
  }
}

export default loadConfig;
