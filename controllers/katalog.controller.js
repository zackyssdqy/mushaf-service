import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";
import { v2 as cloudinary } from "cloudinary";
import cache from "../utils/cache.js";

// Helper convert JS array → PostgreSQL array literal
const toPgArray = (arr) => {
  if (!arr || !Array.isArray(arr)) return null;
  // untuk PostgreSQL array literal: '{val1,val2}'
  return `{${arr.map((v) => `"${v}"`).join(",")}}`;
};

// GET all katalog (CACHE dengan preload TTL 7 menit)
export const getAllKatalog = async (req, res) => {
  try {
    console.log("Cache keys before get:", cache.keys());

    const cacheKey = "all_katalog";
    const cached = cache.get(cacheKey);

    if (cached) {
      console.log("Cache hit for all_katalog"); // log saat ambil dari cache
      return res.json(cached);
    }

    console.log("Cache miss for all_katalog, querying database..."); // log saat query DB
    const result = await pool.query(
      "SELECT * FROM katalog ORDER BY createddate DESC"
    );

    // Simpan ke cache TTL 7 menit
    cache.set(cacheKey, result.rows, 60 * 7);

    console.log("Cache keys after set:", cache.keys()); // log setelah set cache
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET katalog by ID (CACHE per ID)
export const getKatalogById = async (req, res) => {
  const { id } = req.params;

  try {
    const key = `katalog_${id}`;
    const cached = cache.get(key);

    if (cached) {
      console.log(`Cache hit for ${key}`); // log saat ambil dari cache
      return res.json(cached);
    }

    console.log(`Cache miss for ${key}, querying database...`); // log saat query DB
    const result = await pool.query(
      "SELECT * FROM katalog WHERE katalog_id=$1",
      [id]
    );

    if (!result.rows.length)
      return res.status(404).json({ error: "Katalog not found" });

    // Simpan ke cache TTL 7 menit
    cache.set(key, result.rows[0], 60 * 7);

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// CREATE katalog
export const createKatalog = async (req, res) => {
  const { nama_katalog, deskripsi, spesifikasi } = req.body;
  const image = req.file ? req.file.path : null; // Cloudinary URL
  const katalog_id = uuidv4();
  const pgSpecs = toPgArray(spesifikasi);

  try {
    const result = await pool.query(
      `INSERT INTO katalog (katalog_id, nama_katalog, deskripsi, image, spesifikasi)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [katalog_id, nama_katalog, deskripsi, image, pgSpecs]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// UPDATE katalog
export const updateKatalog = async (req, res) => {
  const { id } = req.params;
  const { nama_katalog, deskripsi, spesifikasi } = req.body;
  const image = req.file ? req.file.path : null;
  const pgSpecs = toPgArray(spesifikasi);

  try {
    const result = await pool.query(
      `UPDATE katalog SET
        nama_katalog = COALESCE($1, nama_katalog),
        deskripsi = COALESCE($2, deskripsi),
        spesifikasi = COALESCE($3, spesifikasi),
        image = COALESCE($4, image)
       WHERE katalog_id=$5
       RETURNING *`,
      [nama_katalog, deskripsi, pgSpecs, image, id]
    );

    if (!result.rows.length)
      return res.status(404).json({ error: "Katalog not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE katalog
export const deleteKatalog = async (req, res) => {
  const { id } = req.params;
  try {
    const katalog = await pool.query(
      "SELECT * FROM katalog WHERE katalog_id=$1",
      [id]
    );
    if (!katalog.rows.length)
      return res.status(404).json({ error: "Katalog not found" });

    // Hapus gambar dari Cloudinary jika ada
    const imageUrl = katalog.rows[0].image;
    if (imageUrl) {
      const publicId = imageUrl.split("/").pop().split(".")[0];
      cloudinary.uploader.destroy(`uploads/${publicId}`, (err, result) => {
        if (err) console.error(err);
      });
    }

    await pool.query("DELETE FROM katalog WHERE katalog_id=$1", [id]);
    res.json({ message: "Katalog deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
