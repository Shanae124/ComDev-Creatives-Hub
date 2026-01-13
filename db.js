const { Pool } = require("pg");
require("dotenv").config();

let pool;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
  });
} else {
  pool = new Pool({
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "Protexxalearn",
    password: process.env.DB_PASSWORD || "letsgo",
    port: process.env.DB_PORT || 5432,
  });
}

pool.on("error", (err) => {
  console.error("❌ Unexpected error on idle client:", err);
});

module.exports = pool;