// test-db.js
import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Supabase wajib SSL
});

async function testConnection() {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("✅ DB connected! Server time:", res.rows[0]);
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
  } finally {
    await pool.end();
  }
}

testConnection();
