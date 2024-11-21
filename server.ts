import express from 'express';
import './config/observatory'; // Ensure the config is loaded
import '../database/migrate'; // Run migrations automatically

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
  console.log(`Database URL: ${(global as any).config.databaseUrl}`);
  console.log(`Server running on port: ${(global as any).config.port}`);
});

export default app;