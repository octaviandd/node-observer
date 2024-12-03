/** @format */

import { Router } from "express";
import RequestWatcher from "../watchers/RequestWatcher";
import MailWatcher from "../watchers/MailWatcher";
import RedisWatcher from "../watchers/RedisWatcher";
import ScheduleWatcher from "../watchers/ScheduleWatcher";
import NotificationWatcher from "../watchers/NotificationWatcher";
import ExceptionWatcher from "../watchers/ExceptionWatcher";
import QueryWatcher from "../watchers/QueryWatcher";
import HTTPClientWatcher from "../watchers/HTTPClientWatcher";
import CacheWatcher from "../watchers/CacheWatcher";
import LogWatcher from "../watchers/LogWatcher";
import JobWatcher from "../watchers/JobWatcher";
import connection from "../database/connection";
import config from "../config/observatory";

const router = Router();

router.get("/", (req, res) => {
  console.log("Home index");
});

// Requests entries...
const requestController = new RequestWatcher();
router.get("/requests", (req, res) => requestController.getIndex(req, res));
router.get("/requests/:requestId", (req, res) =>
  requestController.getView(req, res)
);

const mailController = new MailWatcher();
router.get("/mails", (req, res) => mailController.getIndex(req, res));
router.get("/mails/:mailId", (req, res) => {
  mailController.getView(req, res);
});

// Redis Commands entries...
const redisController = new RedisWatcher();
router.get("/redis", (req, res) => {
  redisController.getIndex(req, res);
});
router.get("/redis/:redisRowId", (req, res) => {
  redisController.getView(req, res);
});

const scheduleController = new ScheduleWatcher();
// Scheduled Commands entries...
router.get("/schedules", (req, res) => {
  scheduleController.getIndex(req, res);
});
router.get("/schedules/:scheduleId", (req, res) => {
  scheduleController.getView(req, res);
});

const notificationController = new NotificationWatcher();
router.get("/notifications", (req, res) => {
  notificationController.getIndex(req, res);
});
router.get("/notifications/:notificationId", (req, res) => {
  notificationController.getView(req, res);
});

const exceptionController = new ExceptionWatcher();
// Exception entries...
router.get("/exceptions", (req, res) => {
  exceptionController.getIndex(req, res);
});
router.get("/exceptions/:exceptionId", (req, res) => {
  exceptionController.getView(req, res);
});

const queriesController = new QueryWatcher();
// Queries entries...
router.get("/queries", (req, res) => {
  queriesController.getIndex(req, res);
});
router.get("/queries/:queryId", (req, res) => {
  queriesController.getView(req, res);
});

const httpClientController = new HTTPClientWatcher();
// HTTP Client entries...
router.get("/http", (req, res) => {
  httpClientController.getIndex(req, res);
});
router.get("/http/:httpId", (req, res) => {
  httpClientController.getView(req, res);
});

const cacheController = new CacheWatcher();
// Cache entries...
router.get("/cache", (req, res) => {
  cacheController.getIndex(req, res);
});
router.get("/cache/:cacheId", (req, res) => {
  cacheController.getView(req, res);
});

const logController = new LogWatcher();
// Log entries...
router.get("/logs", (req, res) => {
  logController.getIndex(req, res);
});
router.get("/logs/:logId", (req, res) => {
  logController.getView(req, res);
});

const jobController = new JobWatcher();
// Queue entries...
router.get("/jobs", (req, res) => {
  jobController.getIndex(req, res);
});
router.get("/jobs/:jobId", (req, res) => {
  jobController.getView(req, res);
});

// Queue Batches entries...
router.get("/batches", (req, res) => {
  // Handle batches index
});
router.get("/batches/:batchId", (req, res) => {
  // Handle batches show
});

// Events entries...
router.get("/events", (req, res) => {
  // Handle events index
});
router.get("/events/:eventId", (req, res) => {
  // Handle events show
});

// Eloquent entries...
router.get("/models", (req, res) => {
  // Handle models index
});
router.get("/models/:modelId", (req, res) => {
  // Handle models show
});

// View entries...
router.get("/views", (req, res) => {
  // Handle views index
});
router.get("/views/:viewId", (req, res) => {
  // Handle views show
});

// Artisan Commands entries...
router.get("/commands", (req, res) => {
  // Handle commands index
});
router.get("/commands/:commandId", (req, res) => {
  // Handle commands show
});

// Monitored Tags...
router.get("/monitored-tags", (req, res) => {
  // Handle monitored tags index
});
router.post("/monitored-tags", (req, res) => {
  // Handle monitored tags store
});
router.post("/monitored-tags/delete", (req, res) => {
  // Handle monitored tags destroy
});

// Toggle Recording...
router.get("/toggle-recording", (req, res) => {
  config.observatoryPaused = !config.observatoryPaused;

  return res.status(200).json({
    message: `Observatory recording is now ${
      config.observatoryPaused ? "paused" : "enabled"
    }`,
  });
});

// Clear Entries...
router.delete("/entries", (req, res) => {
  try {
    connection("observatory_entries").truncate();
    return res.status(200).json({ message: "Entries cleared" });
  } catch (e) {
    console.error(e);
  }
});
// Handle entries destroy

export default router;
