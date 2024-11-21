import express from 'express';
import { runMigration, rollbackMigration } from './database/migrate';
import { requestLogger } from './middleware/requestLogger';
import routes from './routes/routes';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use the requestLogger middleware to gather data.
app.use(requestLogger);

app.use('/api', routes);

// API routes
app.get('/', (req, res) => {
  res.send('Hello World');
});

const PORT = 9999;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// runMigration().catch((err) => {
//   console.error(err);
//   process.exit(1);
// });

// rollbackMigration().catch((err) => {
//   console.error(err);
//   process.exit(1);
// })

export default app;