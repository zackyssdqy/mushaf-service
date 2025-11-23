import pool from "../config/db.js";

// GET all kategori
export const getAllKategori = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM kategori_artikel ORDER BY nama_kategori ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET kategori by ID
export const getKategoriById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM kategori_artikel WHERE kategori_id=$1", [id]);
    if (!result.rows.length) return res.status(404).json({ error: "Kategori not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

import { v4 as uuidv4 } from "uuid";

export const createKategori = async (req, res) => {
  const { nama_kategori } = req.body;

  try {
    const kategori_id = uuidv4(); // generate ID otomatis

    const result = await pool.query(
      "INSERT INTO kategori_artikel (kategori_id, nama_kategori) VALUES ($1,$2) RETURNING *",
      [kategori_id, nama_kategori]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


// UPDATE kategori
export const updateKategori = async (req, res) => {
  const { id } = req.params;
  const { nama_kategori } = req.body;
  try {
    const result = await pool.query(
      "UPDATE kategori_artikel SET nama_kategori=COALESCE($1, nama_kategori) WHERE kategori_id=$2 RETURNING *",
      [nama_kategori, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Kategori not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE kategori
export const deleteKategori = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM kategori_artikel WHERE kategori_id=$1 RETURNING *", [id]);
    if (!result.rows.length) return res.status(404).json({ error: "Kategori not found" });
    res.json({ message: "Kategori deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
