require("dotenv").config();
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
async function reset() {
  const hash = await bcrypt.hash("SchoolAdmin2024!", 12);
  const result = await pool.query("UPDATE staff SET password = $1 WHERE email = $2", [hash, "admin@lyceebilinguesdebona.educaid.io"]);
  console.log("Done! Rows updated:", result.rowCount);
  await pool.end();
}
reset();
