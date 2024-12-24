export const { setupLogger } = require("./lib/logger");
import { createConnection } from "mysql2/promise";

const mysql2Connection = createConnection({
  host: "localhost",
  user: "root",
  password: "Database.123",
  database: "observatory",
});

setupLogger({}, "mysql2", mysql2Connection);