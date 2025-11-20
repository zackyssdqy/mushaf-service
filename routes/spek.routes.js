import express from "express";
import {
  getSpekByKatalog,
  createSpek,
  updateSpek,
  deleteSpek,
} from "../controllers/spek.controller.js";

const router = express.Router();

router.get("/:katalog_id", getSpekByKatalog);
router.post("/", createSpek);
router.put("/:id", updateSpek);
router.delete("/:id", deleteSpek);

export default router;
