import pool from "../config/db.js";
import slugify from "slugify";
import { v2 as cloudinary } from "cloudinary";
import cache from "../utils/cache.js";

// GET all artikel (CACHE dengan preload TTL 7 menit)
export const getAllArtikel = async (req, res) => {
  try {
    const cacheKey = "all_artikel";
    const cached = cache.get(cacheKey);

    if (cached) return res.json(cached);

    const result = await pool.query(`
      SELECT 
        a.*,
        p.nama AS penulis_nama,
        k.nama_kategori AS kategori_nama
      FROM artikel a
      LEFT JOIN penulis p ON a.penulis_id = p.penulis_id
      LEFT JOIN kategori_artikel k ON a.kategori_id = k.kategori_id
      ORDER BY a.createddate DESC
    `);

    cache.set(cacheKey, result.rows, 60 * 7);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET artikel by ID (CACHE per ID)
export const getArtikelById = async (req, res) => {
  const { id } = req.params;
  try {
    const key = `artikel_${id}`;
    const cached = cache.get(key);
    if (cached) return res.json(cached);

    const result = await pool.query(
      `
      SELECT 
        a.*,
        p.nama AS penulis_nama,
        k.nama_kategori AS kategori_nama
      FROM artikel a
      LEFT JOIN penulis p ON a.penulis_id = p.penulis_id
      LEFT JOIN kategori_artikel k ON a.kategori_id = k.kategori_id
      WHERE a.artikel_id = $1
      `,
      [id]
    );

    if (!result.rows.length)
      return res.status(404).json({ error: "Artikel not found" });

    cache.set(key, result.rows[0], 60 * 7);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getArtikelBySlug = async (req, res) => {
  const { slug } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
        a.*,
        p.nama AS penulis_nama,
        k.nama_kategori AS kategori_nama
      FROM artikel a
      LEFT JOIN penulis p ON a.penulis_id = p.penulis_id
      LEFT JOIN kategori_artikel k ON a.kategori_id = k.kategori_id
      WHERE a.slug = $1`,
      [slug]
    );

    if (!result.rows.length)
      return res.status(404).json({ error: "Artikel not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// CREATE artikel
export const createArtikel = async (req, res) => {
  const {
    judul,
    excerpt,
    content,
    kategori_id,
    penulis_id,
    tanggal,
    isfeatured,
  } = req.body;
  const artikelTanggal = tanggal || new Date().toISOString().slice(0, 10);
  const featured_image = req.file ? req.file.path : null;
  const slug = slugify(judul, { lower: true, strict: true });

  try {
    const result = await pool.query(
      `INSERT INTO artikel (judul, excerpt, content, kategori_id, penulis_id, tanggal, isfeatured, featured_image, slug)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [
        judul,
        excerpt,
        content,
        kategori_id,
        penulis_id,
        artikelTanggal,
        isfeatured || false,
        featured_image,
        slug,
      ]
    );

    // ⚡ Invalidate cache list
    cache.del("all_artikel");

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// UPDATE artikel
export const updateArtikel = async (req, res) => {
  const { id } = req.params;
  const {
    judul,
    excerpt,
    content,
    kategori_id,
    penulis_id,
    tanggal,
    isfeatured,
  } = req.body;
  const artikelTanggal = tanggal || undefined;
  const featured_image = req.file ? req.file.path : null;
  const slug = judul
    ? slugify(judul, { lower: true, strict: true })
    : undefined;

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
      [
        judul,
        excerpt,
        content,
        kategori_id,
        penulis_id,
        artikelTanggal,
        isfeatured,
        featured_image,
        slug,
        id,
      ]
    );

    if (!result.rows.length)
      return res.status(404).json({ error: "Artikel not found" });

    // ⚡ Invalidate cache list & per ID
    cache.del("all_artikel");
    cache.del(`artikel_${id}`);

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
    const artikel = await pool.query(
      "SELECT * FROM artikel WHERE artikel_id=$1",
      [id]
    );
    if (!artikel.rows.length)
      return res.status(404).json({ error: "Artikel not found" });

    const imageUrl = artikel.rows[0].featured_image;
    if (imageUrl) {
      const publicId = imageUrl.split("/").pop().split(".")[0];
      cloudinary.uploader.destroy(`articles/${publicId}`, (err, result) => {
        if (err) console.error(err);
      });
    }

    await pool.query("DELETE FROM artikel WHERE artikel_id=$1", [id]);

    // ⚡ Invalidate cache list & per ID
    cache.del("all_artikel");
    cache.del(`artikel_${id}`);

    res.json({ message: "Artikel deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
