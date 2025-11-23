import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

// GET all penulis
export const getAllPenulis = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM penulis ORDER BY nama");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET penulis by ID
export const getPenulisById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM penulis WHERE penulis_id=$1", [id]);
    if (!result.rows.length) return res.status(404).json({ error: "Penulis not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// CREATE penulis
export const createPenulis = async (req, res) => {
  const { nama } = req.body;

  try {
    const penulis_id = uuidv4();

    const result = await pool.query(
      `INSERT INTO penulis (penulis_id, nama) VALUES ($1, $2) RETURNING *`,
      [penulis_id, nama]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


// UPDATE penulis
export const updatePenulis = async (req, res) => {
  const { id } = req.params;
  const { nama } = req.body;
  try {
    const result = await pool.query(
      `UPDATE penulis SET nama=$1 WHERE penulis_id=$2 RETURNING *`,
      [nama, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Penulis not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE penulis
export const deletePenulis = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM penulis WHERE penulis_id=$1 RETURNING *`,
      [id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Penulis not found" });
    res.json({ message: "Penulis deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
