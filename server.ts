import express from 'express';
import { runMigration, rollbackMigration } from './database/migrate';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use the requestLogger middleware to gather data.
// app.use(requestLogger);

// API routes
// app.use('/api', routes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Server running on port: ${(global as any)}`);
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