import express from "express";
import upload from "../middleware/upload.js";
import {
  getAllArtikel,
  getArtikelById,
  createArtikel,
  updateArtikel,
  deleteArtikel,
} from "../controllers/artikel.controller.js";

const router = express.Router();

router.get("/", getAllArtikel);
router.get("/:id", getArtikelById);
router.post("/", upload.single("featured_image"), createArtikel);
router.put("/:id", upload.single("featured_image"), updateArtikel);
router.delete("/:id", deleteArtikel);

export default router;
