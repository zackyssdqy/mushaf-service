import pool from "../config/db.js";

// GET all spek_katalog by katalog_id
export const getSpekByKatalog = async (req, res) => {
  const { katalog_id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM spek_katalog WHERE katalog_id=$1",
      [katalog_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// CREATE spek_katalog
export const createSpek = async (req, res) => {
  const { spek_katalog_id, spesifikasi, katalog_id } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO spek_katalog (spek_katalog_id, spesifikasi, katalog_id) VALUES ($1,$2,$3) RETURNING *",
      [spek_katalog_id, spesifikasi, katalog_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// UPDATE spek_katalog
export const updateSpek = async (req, res) => {
  const { id } = req.params;
  const { spesifikasi } = req.body;
  try {
    const result = await pool.query(
      "UPDATE spek_katalog SET spesifikasi=$1 WHERE spek_katalog_id=$2 RETURNING *",
      [spesifikasi, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Spek not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE spek_katalog
export const deleteSpek = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM spek_katalog WHERE spek_katalog_id=$1 RETURNING *",
      [id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Spek not found" });
    res.json({ message: "Spek deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
