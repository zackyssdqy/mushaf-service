import express from "express";
import {
  createPemesanan,
  getAllPemesanan,
  getPemesananById,
  updateStatusPemesanan
} from "../controllers/pemesanan.controller.js";

const router = express.Router();

router.post("/", createPemesanan);
router.get("/", getAllPemesanan);
router.get("/:id", getPemesananById);
router.put("/:id/status", updateStatusPemesanan);

export default router;
