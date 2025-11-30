import express from "express";
import upload from "../middleware/upload.js";
import { verifyAdmin } from "../middleware/auth.js";

import {
  getAllArtikel,
  getArtikelById,
  createArtikel,
  updateArtikel,
  deleteArtikel,
  getArtikelBySlug
} from "../controllers/artikel.controller.js";

const router = express.Router();

router.get("/", getAllArtikel);
router.get("/:id", getArtikelById);
router.get("/slug/:slug", getArtikelBySlug);

router.post("/", verifyAdmin, upload.single("featured_image"), createArtikel);
router.put("/:id", verifyAdmin, upload.single("featured_image"), updateArtikel);
router.delete("/:id", verifyAdmin, deleteArtikel);



export default router;
