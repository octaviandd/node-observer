import express from 'express';
import routes from './routes.js';
import { requestLogger } from './middleware/requestLogger.js';
import '../database/migrate.js'; // Run migrations automatically
import {engine} from "express-handlebars"

function startServer(){
  const app = express();

  app.use(express.json());
  app.use(express.static('public'));
  app.use(express.urlencoded({ extended: true }));
  app.engine('handlebars', engine());
  app.set('view engine', 'handlebars');
  app.set('views', './views');

  // Use the requestLogger middleware to gather data.
  app.use(requestLogger);

  app.use('/api', routes);

  const PORT = process.env.PORT || 4000;

  app.listen(PORT, () => {
    console.log(`Telescope server running at http://localhost:${PORT}`)
  })
}

startServer();

export default startServer;