import pool from "../config/db.js";
import slugify from "slugify";

// GET all artikel
export const getAllArtikel = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM artikel ORDER BY createddate DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
//cek branch

// GET artikel by ID
export const getArtikelById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM artikel WHERE artikel_id=$1", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Artikel not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// CREATE artikel
export const createArtikel = async (req, res) => {
  const { judul, excerpt, content, kategori_id, penulis_id, tanggal, isfeatured } = req.body;
  const featured_image = req.file ? req.file.filename : null;
  const slug = slugify(judul, { lower: true, strict: true });

  try {
    const result = await pool.query(
      `INSERT INTO artikel (judul, excerpt, content, kategori_id, penulis_id, tanggal, isfeatured, featured_image, slug)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [judul, excerpt, content, kategori_id, penulis_id, tanggal, isfeatured || false, featured_image, slug]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// UPDATE artikel
export const updateArtikel = async (req, res) => {
  const { id } = req.params;
  const { judul, excerpt, content, kategori_id, penulis_id, tanggal, isfeatured } = req.body;
  const featured_image = req.file ? req.file.filename : null;
  const slug = judul ? slugify(judul, { lower: true, strict: true }) : undefined;

  try {
    const result = await pool.query(
      `UPDATE artikel SET
        judul = COALESCE($1, judul),
        excerpt = COALESCE($2, excerpt),
        content = COALESCE($3, content),
        kategori_id = COALESCE($4, kategori_id),
        penulis_id = COALESCE($5, penulis_id),
        tanggal = COALESCE($6, tanggal),
        isfeatured = COALESCE($7, isfeatured),
        featured_image = COALESCE($8, featured_image),
        slug = COALESCE($9, slug)
       WHERE artikel_id=$10
       RETURNING *`,
      [judul, excerpt, content, kategori_id, penulis_id, tanggal, isfeatured, featured_image, slug, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Artikel not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE artikel
export const deleteArtikel = async (req, res) => {
  const { id } = req.params;
  try {
    const artikel = await pool.query("SELECT * FROM artikel WHERE artikel_id=$1", [id]);
    if (!artikel.rows.length) return res.status(404).json({ error: "Artikel not found" });

    const imageFile = artikel.rows[0].featured_image;
    if (imageFile) {
      const filePath = path.join("uploads", imageFile);
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting image file:", err);
      });
    }

    await pool.query("DELETE FROM artikel WHERE artikel_id=$1", [id]);
    res.json({ message: "Artikel deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

