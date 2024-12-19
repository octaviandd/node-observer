/** @format */

import express from "express";
import routes from "./routes/routes";
import cors from "cors";
import { setupLogger } from "./lib/logger";
import { createClient, RedisClientType } from "redis";

const redisConnection: RedisClientType = createClient({
  url: "redis://localhost:6379",
});

const config = {
  packages: {
    errors: ["uncaught", "unhandled"],
    logging: {
      name: ["winston"],
      connection: {},
    },
    database: {
      name: ["knex"],
      connection: {},
    },
    jobs: ["bull"],
    scheduler: {
      name: ["node-schedule"],
      connection: {},
    },
    mailer: {
      name: ["nodemailer"],
      connection: {},
    },
    cache: {
      name: ["redis"],
      connection: {},
    },
    notifications: {
      name: ["pusher"],
      connection: {},
    },
    requests: ["express"],
    http: ["axios"],
  },
};

setupLogger(config, "redis", redisConnection);

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use("/observatory-api/data", routes);

// API routes
app.get("/", async (req, res) => {});

const PORT = 9999;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
