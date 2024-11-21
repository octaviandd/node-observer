import express from 'express';
// import '../database/migrate.js'; // Run migrations automatically

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
});

export default app;