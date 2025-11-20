import express from "express";
import upload from "../middleware/upload.js";
import {
  getAllKatalog,
  getKatalogById,
  createKatalog,
  updateKatalog,
  deleteKatalog,
} from "../controllers/katalog.controller.js";

const router = express.Router();

router.get("/", getAllKatalog);
router.get("/:id", getKatalogById);
router.post("/", upload.single("image"), createKatalog);
router.put("/:id", upload.single("image"), updateKatalog);
router.delete("/:id", deleteKatalog);

export default router;
