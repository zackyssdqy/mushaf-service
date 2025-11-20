// import pkg from "pg";
// import dotenv from "dotenv";
// dotenv.config();

// const { Pool } = pkg;

// const pool = new Pool({
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// });

// // Optional: cek koneksi
// pool.connect((err) => {
//   if (err) {
//     console.error("DB connection error:", err.stack);
//   } else {
//     console.log("DB connected successfully!");
//   }
// });

// export default pool;


import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // wajib kalau pakai Supabase
});

pool.connect((err) => {
  if (err) {
    console.error("DB connection error:", err.stack);
  } else {
    console.log("DB connected successfully!");
  }
});

export default pool;


