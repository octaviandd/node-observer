/** @format */

import express from "express";
import { runMigration, rollbackMigration } from "./database/migrate";
import { requestLogger } from "./middleware/requestLogger";
import routes from "./routes/routes";
import withObserver from "./middleware/collectorMiddleware";
import EventEmitter from "events";
import schedule from "node-schedule";
import Redis from "ioredis";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.use("/api", routes);

const event = new EventEmitter();

// withObserver("redis", { key: "mykey", value: "value" }, () =>
//   redis.set("mykey", "value")
// );

// API routes
app.get("/", (req, res) => {
  res.send("Hello World");

  withObserver("event", { eventName: "test", props: { userId: 1 } }, () =>
    event.emit("test")
  );
  withObserver("job", { job: "test" }, () =>
    schedule.scheduleJob("10 * * * *", function () {
      console.log("The answer to life, the universe, and everything!");
    })
  );
});

app.use((req, res, next) => {
  console.log("next");
  next();
});

const PORT = 9999;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const redis = new Redis({
  port: 6379, // Redis port
  host: "127.0.0.1", // Redis host
  db: 0, // Optional database index
});

redis.on("error", (err) => {
  console.error("Redis Error:", err);
});

redis.on("connect", () => {
  console.log("Connected to Redis");
  withObserver("redis", { key: "mykey", value: "value" }, () =>
    redis.set("mykey", "value")
  );
});

redis
  .ping()
  .then((res) => console.log("Redis connection successful:", res))
  .catch((err) => console.error("Redis connection failed:", err));

// runMigration().catch((err) => {
//   console.error(err);
//   process.exit(1);
// });

// rollbackMigration().catch((err) => {
//   console.error(err);
//   process.exit(1);
// })

export default app;
