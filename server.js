import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import pool from "./config/db.js";
import cache from "./utils/cache.js";

// Routes
import artikelRoutes from "./routes/artikel.routes.js";
import penulisRoutes from "./routes/penulis.routes.js";
import katalogRoutes from "./routes/katalog.routes.js";
import spekRoutes from "./routes/spek.routes.js";
import kategoriRoutes from "./routes/kategori.routes.js";
import pemesananRoutes from "./routes/pemesanan.routes.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => res.send("Backend Mushaf Krapyak ready!"));

// Routes
app.use("/artikel", artikelRoutes);
app.use("/penulis", penulisRoutes);
app.use("/katalog", katalogRoutes);
app.use("/spek", spekRoutes);
app.use("/kategori", kategoriRoutes);
app.use("/pemesanan", pemesananRoutes);
app.use("/auth", authRoutes);

// Static folder
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// -----------------------
// Preload cache function
// -----------------------
const preloadCache = async () => {
  try {
    console.log("Preloading cache...");

    // Preload all_artikel
    const artikelRes = await pool.query(`
      SELECT 
        a.*,
        p.nama AS penulis_nama,
        k.nama_kategori AS kategori_nama
      FROM artikel a
      LEFT JOIN penulis p ON a.penulis_id = p.penulis_id
      LEFT JOIN kategori_artikel k ON a.kategori_id = k.kategori_id
      ORDER BY a.createddate DESC
    `);
    cache.set("all_artikel", artikelRes.rows, 60 * 7); // TTL 7 menit
    console.log(`Cached all_artikel: ${artikelRes.rows.length} rows`);

    // Preload all_katalog
    const katalogRes = await pool.query(
      "SELECT * FROM katalog ORDER BY createddate DESC"
    );
    cache.set("all_katalog", katalogRes.rows, 60 * 7); // TTL 7 menit
    console.log(`Cached all_katalog: ${katalogRes.rows.length} rows`);

    console.log("Preload cache selesai ✅");
  } catch (err) {
    console.error("Error preloading cache:", err);
  }
};

preloadCache();

// Start server
const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0"; // <-- tambah ini
app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
