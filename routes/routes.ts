/** @format */

import { Router } from "express";
import { watchers } from "../lib/logger";

const router = Router();

router.get("/test", (req, res) => {
  return res.status(200).json({ message: "Test route" });
});

// Requests entries...
router.get("/requests", (req, res) => {
  watchers.requests.getIndex(req, res);
});
router.get("/requests/:requestId", (req, res) =>
  watchers.requests.getView(req, res)
);

router.get("/mails", (req, res) => watchers.mailer.getIndex(req, res));
router.get("/mails/:mailId", (req, res) => {
  watchers.mailer.getView(req, res);
});

// // Redis Commands entries...
// const redisController = new RedisWatcher();
// router.get("/redis", (req, res) => {
//   redisController.getIndex(req, res);
// });
// router.get("/redis/:redisRowId", (req, res) => {
//   redisController.getView(req, res);
// });

// Scheduled Commands entries...
router.get("/schedules", (req, res) => {
  watchers.scheduler.getIndex(req, res);
});
router.get("/schedules/:scheduleId", (req, res) => {
  watchers.scheduler.getView(req, res);
});

router.get("/notifications", (req, res) => {
  watchers.notifications.getIndex(req, res);
});
router.get("/notifications/:notificationId", (req, res) => {
  watchers.notifications.getView(req, res);
});

// Exception entries...
router.get("/exceptions", (req, res) => {
  watchers.exceptions.getIndex(req, res);
});
router.get("/exceptions/:exceptionId", (req, res) => {
  watchers.exceptions.getView(req, res);
});

// Queries entries...
router.get("/queries", (req, res) => {
  watchers.database.getIndex(req, res);
});
router.get("/queries/:queryId", (req, res) => {
  watchers.database.getView(req, res);
});

// HTTP Client entries...
router.get("/http", (req, res) => {
  watchers.http.getIndex(req, res);
});
router.get("/http/:httpId", (req, res) => {
  watchers.http.getView(req, res);
});

// Cache entries...
router.get("/cache", (req, res) => {
  watchers.cache.getIndex(req, res);
});
router.get("/cache/:cacheId", (req, res) => {
  watchers.cache.getView(req, res);
});

// Log entries...
router.get("/logs", (req, res) => {
  watchers.logging.getIndex(req, res);
});
router.get("/logs/:logId", (req, res) => {
  watchers.logging.getView(req, res);
});

// Queue entries...
router.get("/jobs", (req, res) => {
  watchers.jobs.getIndex(req, res);
});
router.get("/jobs/:jobId", (req, res) => {
  watchers.jobs.getView(req, res);
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
  // config.observatoryPaused = !config.observatoryPaused;
  // return res.status(200).json({
  //   message: `Observatory recording is now ${
  //     config.observatoryPaused ? "paused" : "enabled"
  //   }`,
  // });
});

// Clear Entries...
// router.delete("/entries", (req, res) => {
//   try {
//     connection("observatory_entries").truncate();
//     return res.status(200).json({ message: "Entries cleared" });
//   } catch (e) {
//     console.error(e);
//   }
// });
// Handle entries destroy

export default router;
