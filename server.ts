/** @format */

import express from "express";
import routes from "./routes/routes";
import cors from "cors";
import { setupLogger } from "./lib/logger";
import { createClient, RedisClientType } from "redis";
import mysql from "mysql";
import * as mysql2 from "mysql2/promise";
import winston from "winston";
import { Config } from "./types";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

const redisConnection: RedisClientType = createClient({
  url: "redis://localhost:6379",
});

const mysqlConnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "observatory",
});

const mysql2Connection = mysql2.createConnection({
  host: "localhost",
  user: "root",
  database: "observatory",
});

const config: Config = {
  packages: {
    requests: "express",
    logging: [
      {
        name: "winston",
        connection: logger,
      },
    ],
  },
};

async function setup() {
  await setupLogger(config, "mysql2", mysql2Connection);
}

setup();

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use("/observatory-api/data", routes);

app.get("/test", (req, res) => {
  res.send("Hello world");
});
// API routes
app.get("/", async (req, res) => {
  res.status(200).json({ message: "Welcome to the observatory API" });
  winston.error("Welcome to the observatory API");
});

const PORT = 9999;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
