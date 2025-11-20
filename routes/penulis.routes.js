import express from "express";
import {
  getAllPenulis,
  getPenulisById,
  createPenulis,
  updatePenulis,
  deletePenulis,
} from "../controllers/penulis.controller.js";

const router = express.Router();

router.get("/", getAllPenulis);
router.get("/:id", getPenulisById);
router.post("/", createPenulis);
router.put("/:id", updatePenulis);
router.delete("/:id", deletePenulis);

export default router;
