import express from "express";
import upload from "../middleware/upload.js";
import {
  getAllKatalog,
  getKatalogById,
  createKatalog,
  updateKatalog,
  deleteKatalog,
} from "../controllers/katalog.controller.js";
import { verifyAdmin } from "../middleware/auth.js";


const router = express.Router();

router.get("/", getAllKatalog);
router.get("/:id", getKatalogById);

router.post("/", verifyAdmin, upload.single("image"), createKatalog);
router.put("/:id", verifyAdmin, upload.single("image"), updateKatalog);
router.delete("/:id", verifyAdmin, deleteKatalog);


export default router;
