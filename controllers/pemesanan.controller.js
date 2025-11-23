import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

// Generate Kode Pesanan (ORD-YYYYMMDD-XXXX)
const generateKodePesanan = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `ORD-${date}-${rand}`;
};

// CREATE pemesanan
export const createPemesanan = async (req, res) => {
  const {
    email,
    nama,
    alamat,
    instansi,
    keperluan,
    whatsapp,
    jumlah,
    seri_mushaf
  } = req.body;

  try {
    const id_pemesanan = uuidv4();
    const kode_pesanan = generateKodePesanan();
    const status_pesanan = "Baru";

    const query = `
      INSERT INTO pemesanan (
        id_pemesanan, kode_pesanan, email, nama, alamat, instansi,
        keperluan, whatsapp, jumlah, seri_mushaf, status_pesanan
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *;
    `;

    const values = [
      id_pemesanan, kode_pesanan, email, nama, alamat, instansi,
      keperluan, whatsapp, jumlah, seri_mushaf, status_pesanan
    ];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET ALL pemesanan
export const getAllPemesanan = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM pemesanan ORDER BY created_date DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET pemesanan by ID
export const getPemesananById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM pemesanan WHERE id_pemesanan = $1",
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Pemesanan tidak ditemukan" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// UPDATE status pemesanan
export const updateStatusPemesanan = async (req, res) => {
  const { id } = req.params;
  const { status_pesanan } = req.body;

  try {
    const result = await pool.query(
      `UPDATE pemesanan SET status_pesanan=$1 WHERE id_pemesanan=$2 RETURNING *`,
      [status_pesanan, id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Pemesanan tidak ditemukan" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
