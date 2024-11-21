import { Router } from 'express';
import RequestWatcher from '../watchers/RequestWatcher';

const router = Router();

router.get('/logs', (req, res) => {
  // res.json(requestCollector.getLogs());
});

// router.post("/observatory/mail", (req, res) => {
//   const mailCollector = new MailCollector();
//   mailCollector.addMail(req.body);
//   res.json({ message: 'Mail added' });
// })

// router.post("/observatory/notifications", (req, res) => {
//   const notificationCollector = new NotificationCollector();
//   notificationCollector.addNotification(req.body);
//   res.json({ message: 'Notification added' });
// })

router.get('/', (req, res) => {
  // Handle home index
  console.log('Home index');
});


router.post('/observatory-api/mail', (req, res) => {
  // Handle mail index
});
router.get('/observatory-api/mail/:observatoryEntryId', (req, res) => {
  // Handle mail show
});
router.get('/observatory-api/mail/:observatoryEntryId/preview', (req, res) => {
  // Handle mail preview
});
router.get('/observatory-api/mail/:observatoryEntryId/download', (req, res) => {
  // Handle mail download
});

// Exception entries...
router.post('/observatory-api/exceptions', (req, res) => {
  // Handle exceptions index
});
router.get('/observatory-api/exceptions/:observatoryEntryId', (req, res) => {
  // Handle exceptions show
});
router.put('/observatory-api/exceptions/:observatoryEntryId', (req, res) => {
  // Handle exceptions update
});

// Dump entries...
router.post('/observatory-api/dumps', (req, res) => {
  // Handle dumps index
});

// Log entries...
router.post('/observatory-api/logs', (req, res) => {
  // Handle logs index
});
router.get('/observatory-api/logs/:observatoryEntryId', (req, res) => {
  // Handle logs show
});

// Notifications entries...
router.post('/observatory-api/notifications', (req, res) => {
  // Handle notifications index
});
router.get('/observatory-api/notifications/:observatoryEntryId', (req, res) => {
  // Handle notifications show
});

// Queue entries...
router.post('/observatory-api/jobs', (req, res) => {
  // Handle jobs index
});
router.get('/observatory-api/jobs/:observatoryEntryId', (req, res) => {
  // Handle jobs show
});

// Queue Batches entries...
router.post('/observatory-api/batches', (req, res) => {
  // Handle batches index
});
router.get('/observatory-api/batches/:observatoryEntryId', (req, res) => {
  // Handle batches show
});

// Events entries...
router.post('/observatory-api/events', (req, res) => {
  // Handle events index
});
router.get('/observatory-api/events/:observatoryEntryId', (req, res) => {
  // Handle events show
});

// Gates entries...
router.post('/observatory-api/gates', (req, res) => {
  // Handle gates index
});
router.get('/observatory-api/gates/:observatoryEntryId', (req, res) => {
  // Handle gates show
});

// Cache entries...
router.post('/observatory-api/cache', (req, res) => {
  // Handle cache index
});
router.get('/observatory-api/cache/:observatoryEntryId', (req, res) => {
  // Handle cache show
});

// Queries entries...
router.post('/observatory-api/queries', (req, res) => {
  // Handle queries index
});
router.get('/observatory-api/queries/:observatoryEntryId', (req, res) => {
  // Handle queries show
});

// Eloquent entries...
router.post('/observatory-api/models', (req, res) => {
  // Handle models index
});
router.get('/observatory-api/models/:observatoryEntryId', (req, res) => {
  // Handle models show
});

// // Requests entries...
// router.post('/observatory-api/requests', (req, res) => requestsController.index(req, res));
// router.get('/observatory-api/requests/:observatoryEntryId', (req, res) => {
//   // Handle requests show
// });

// View entries...
router.post('/observatory-api/views', (req, res) => {
  // Handle views index
});
router.get('/observatory-api/views/:observatoryEntryId', (req, res) => {
  // Handle views show
});

// Artisan Commands entries...
router.post('/observatory-api/commands', (req, res) => {
  // Handle commands index
});
router.get('/observatory-api/commands/:observatoryEntryId', (req, res) => {
  // Handle commands show
});

// Scheduled Commands entries...
router.post('/observatory-api/schedule', (req, res) => {
  // Handle schedule index
});
router.get('/observatory-api/schedule/:observatoryEntryId', (req, res) => {
  // Handle schedule show
});

// Redis Commands entries...
router.post('/observatory-api/redis', (req, res) => {
  // Handle redis index
});
router.get('/observatory-api/redis/:observatoryEntryId', (req, res) => {
  // Handle redis show
});

// Client Requests entries...
router.post('/observatory-api/client-requests', (req, res) => {
  // Handle client requests index
});
router.get('/observatory-api/client-requests/:observatoryEntryId', (req, res) => {
  // Handle client requests show
});

// Monitored Tags...
router.get('/observatory-api/monitored-tags', (req, res) => {
  // Handle monitored tags index
});
router.post('/observatory-api/monitored-tags', (req, res) => {
  // Handle monitored tags store
});
router.post('/observatory-api/monitored-tags/delete', (req, res) => {
  // Handle monitored tags destroy
});

// Toggle Recording...
router.post('/observatory-api/toggle-recording', (req, res) => {
  // Handle toggle recording
});

// Clear Entries...
router.delete('/observatory-api/entries', (req, res) => {
  // Handle entries destroy
});
  // Handle entries destroy

router.get('/:view?', (req, res) => {
  // Handle home index
});

export default router;
