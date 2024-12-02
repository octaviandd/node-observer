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

const router = Router();

router.get("/logs", (req, res) => {
  // res.json(requestCollector.getLogs());
});

// router.post("/observatory/notifications", (req, res) => {
//   const notificationCollector = new NotificationCollector();
//   notificationCollector.addNotification(req.body);
//   res.json({ message: 'Notification added' });
// })

router.get("/", (req, res) => {
  // Handle home index
  console.log("Home index");
});

// Requests entries...

const requestController = Object.create(RequestWatcher);
router.get("/requests", (req, res) => requestController.getIndex(req, res));
router.get("/requests/:requestId", (req, res) =>
  requestController.getView(req, res)
);

const mailController = Object.create(MailWatcher);
router.get("/mails", (req, res) => mailController.getIndex(req, res));
router.get("/mails/:mailId", (req, res) => {
  mailController.getView(req, res);
});

// Redis Commands entries...
const redisController = Object.create(RedisWatcher);
router.get("/redis", (req, res) => {
  redisController.getIndex(req, res);
});
router.get("/redis/:redisRowId", (req, res) => {
  redisController.getView(req, res);
});

const scheduleController = Object.create(ScheduleWatcher);
// Scheduled Commands entries...
router.get("/schedules", (req, res) => {
  scheduleController.getIndex(req, res);
});
router.get("/schedules/:scheduleId", (req, res) => {
  scheduleController.getView(req, res);
});

const notificationController = Object.create(NotificationWatcher);
router.get("/notifications", (req, res) => {
  notificationController.getIndex(req, res);
});
router.get("/notifications/:notificationId", (req, res) => {
  notificationController.getView(req, res);
});

const exceptionController = Object.create(ExceptionWatcher);
// Exception entries...
router.get("/exceptions", (req, res) => {
  exceptionController.getIndex(req, res);
});
router.get("/exceptions/:exceptionId", (req, res) => {
  exceptionController.getView(req, res);
});

const queriesController = Object.create(QueryWatcher);
// Queries entries...
router.get("/queries", (req, res) => {
  queriesController.getIndex(req, res);
});
router.get("/queries/:queryId", (req, res) => {
  queriesController.getView(req, res);
});

const httpClientController = Object.create(HTTPClientWatcher);
// HTTP Client entries...
router.get("/http", (req, res) => {
  httpClientController.getIndex(req, res);
});
router.get("/http/:requestId", (req, res) => {
  httpClientController.getView(req, res);
});

const cacheController = Object.create(CacheWatcher);
// Cache entries...
router.get("/cache", (req, res) => {
  console.log("hit");
  cacheController.getIndex(req, res);
});
router.get("/cache/:cacheId", (req, res) => {
  cacheController.getView(req, res);
});

// Log entries...
router.post("/logs", (req, res) => {
  // Handle logs index
});
router.get("/logs/:observatoryEntryId", (req, res) => {
  // Handle logs show
});

// Queue entries...
router.post("/jobs", (req, res) => {
  // Handle jobs index
});
router.get("/jobs/:observatoryEntryId", (req, res) => {
  // Handle jobs show
});

// Queue Batches entries...
router.post("/batches", (req, res) => {
  // Handle batches index
});
router.get("/batches/:observatoryEntryId", (req, res) => {
  // Handle batches show
});

// Events entries...
router.post("/events", (req, res) => {
  // Handle events index
});
router.get("/events/:observatoryEntryId", (req, res) => {
  // Handle events show
});

// Eloquent entries...
router.post("/models", (req, res) => {
  // Handle models index
});
router.get("/models/:observatoryEntryId", (req, res) => {
  // Handle models show
});

// View entries...
router.post("/views", (req, res) => {
  // Handle views index
});
router.get("/views/:observatoryEntryId", (req, res) => {
  // Handle views show
});

// Artisan Commands entries...
router.post("/commands", (req, res) => {
  // Handle commands index
});
router.get("/commands/:observatoryEntryId", (req, res) => {
  // Handle commands show
});

// Scheduled Commands entries...
router.post("/schedule", (req, res) => {
  // Handle schedule index
});
router.get("/schedule/:observatoryEntryId", (req, res) => {
  // Handle schedule show
});

// Client Requests entries...
router.post("/client-requests", (req, res) => {
  // Handle client requests index
});
router.get("/client-requests/:observatoryEntryId", (req, res) => {
  // Handle client requests show
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
router.post("/toggle-recording", (req, res) => {
  // Handle toggle recording
});

// Clear Entries...
router.delete("/entries", (req, res) => {
  // Handle entries destroy
});
// Handle entries destroy

router.get("/:view?", (req, res) => {
  // Handle home index
});

export default router;
