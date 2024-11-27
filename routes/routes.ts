/** @format */

import { Router } from "express";
import RequestWatcher from "../watchers/RequestWatcher";
import MailWatcher from "../watchers/MailWatcher";

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

// Exception entries...
router.post("/exceptions", (req, res) => {
  // Handle exceptions index
});
router.get("/exceptions/:observatoryEntryId", (req, res) => {
  // Handle exceptions show
});
router.put("/exceptions/:observatoryEntryId", (req, res) => {
  // Handle exceptions update
});

// Dump entries...
router.post("/dumps", (req, res) => {
  // Handle dumps index
});

// Log entries...
router.post("/logs", (req, res) => {
  // Handle logs index
});
router.get("/logs/:observatoryEntryId", (req, res) => {
  // Handle logs show
});

// Notifications entries...
router.post("/notifications", (req, res) => {
  // Handle notifications index
});
router.get("/notifications/:observatoryEntryId", (req, res) => {
  // Handle notifications show
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

// Gates entries...
router.post("/gates", (req, res) => {
  // Handle gates index
});
router.get("/gates/:observatoryEntryId", (req, res) => {
  // Handle gates show
});

// Cache entries...
router.post("/cache", (req, res) => {
  // Handle cache index
});
router.get("/cache/:observatoryEntryId", (req, res) => {
  // Handle cache show
});

// Queries entries...
router.post("/queries", (req, res) => {
  // Handle queries index
});
router.get("/queries/:observatoryEntryId", (req, res) => {
  // Handle queries show
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

// Redis Commands entries...
router.post("/redis", (req, res) => {
  // Handle redis index
});
router.get("/redis/:observatoryEntryId", (req, res) => {
  // Handle redis show
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
