import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";
import { v2 as cloudinary } from "cloudinary";
import cache from "../utils/cache.js";

// Helper convert JS array → PostgreSQL array literal
const toPgArray = (arr) => {
  if (!arr || !Array.isArray(arr)) return null;
  return `{${arr.map((v) => `"${v}"`).join(",")}}`;
};

// GET all katalog (CACHE TTL 7 menit)
export const getAllKatalog = async (req, res) => {
  try {
    const cacheKey = "all_katalog";
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const result = await pool.query("SELECT * FROM katalog ORDER BY createddate DESC");
    cache.set(cacheKey, result.rows, 60 * 7);
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
    if (cached) return res.json(cached);

    const result = await pool.query("SELECT * FROM katalog WHERE katalog_id=$1", [id]);
    if (!result.rows.length) return res.status(404).json({ error: "Katalog not found" });

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
  const image = req.file ? req.file.path : null;
  const katalog_id = uuidv4();
  const pgSpecs = toPgArray(spesifikasi);

  try {
    const result = await pool.query(
      `INSERT INTO katalog (katalog_id, nama_katalog, deskripsi, image, spesifikasi)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [katalog_id, nama_katalog, deskripsi, image, pgSpecs]
    );

    // ⚡ Invalidate cache list
    cache.del("all_katalog");

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

    if (!result.rows.length) return res.status(404).json({ error: "Katalog not found" });

    // ⚡ Invalidate cache list & per ID
    cache.del("all_katalog");
    cache.del(`katalog_${id}`);

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
    const katalog = await pool.query("SELECT * FROM katalog WHERE katalog_id=$1", [id]);
    if (!katalog.rows.length) return res.status(404).json({ error: "Katalog not found" });

    // Hapus gambar Cloudinary jika ada
    const imageUrl = katalog.rows[0].image;
    if (imageUrl) {
      const publicId = imageUrl.split("/").pop().split(".")[0];
      cloudinary.uploader.destroy(`uploads/${publicId}`, (err, result) => {
        if (err) console.error(err);
      });
    }

    await pool.query("DELETE FROM katalog WHERE katalog_id=$1", [id]);

    // ⚡ Invalidate cache list & per ID
    cache.del("all_katalog");
    cache.del(`katalog_${id}`);

    res.json({ message: "Katalog deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
