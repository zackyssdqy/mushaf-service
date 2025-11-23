import pool from "../config/db.js";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// convert JS array -> PG array literal
const toPgArray = (arr) => {
  if (!arr || !Array.isArray(arr)) return null;
  return `{${arr.map(v => `"${v}"`).join(",")}}`;
};

// GET all katalog
export const getAllKatalog = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM katalog ORDER BY createddate DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET katalog by ID
export const getKatalogById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM katalog WHERE katalog_id=$1", [id]);
    if (!result.rows.length) return res.status(404).json({ error: "Katalog not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// CREATE katalog
export const createKatalog = async (req, res) => {
  const { nama_katalog, deskripsi, spesifikasi } = req.body;
  const image = req.file ? req.file.filename : null;

  const pgSpecs = toPgArray(spesifikasi);
  const katalog_id = uuidv4();

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
  const image = req.file ? req.file.filename : null;

  const pgSpecs = toPgArray(spesifikasi);

  try {
    const result = await pool.query(
      `UPDATE katalog SET 
         nama_katalog = COALESCE($1, nama_katalog),
         deskripsi = COALESCE($2, deskripsi),
         spesifikasi = COALESCE($3, spesifikasi),
         image = COALESCE($4, image)
       WHERE katalog_id = $5 RETURNING *`,
      [nama_katalog, deskripsi, pgSpecs, image, id]
    );

    if (!result.rows.length) return res.status(404).json({ error: "Katalog not found" });
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

    const imageFile = katalog.rows[0].image;
    if (imageFile) {
      const filePath = path.join("uploads", imageFile);
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting image file:", err);
      });
    }

    await pool.query("DELETE FROM katalog WHERE katalog_id=$1", [id]);
    res.json({ message: "Katalog deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
