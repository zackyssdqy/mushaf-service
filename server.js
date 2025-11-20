import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Backend Mushaf Krapyak ready!"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import artikelRoutes from "./routes/artikel.routes.js";
app.use("/api/artikel", artikelRoutes);

import penulisRoutes from "./routes/penulis.routes.js";
app.use("/api/penulis", penulisRoutes);

import katalogRoutes from "./routes/katalog.routes.js";
app.use("/api/katalog", katalogRoutes);

import spekRoutes from "./routes/spek.routes.js";
app.use("/api/spek", spekRoutes);

import kategoriRoutes from "./routes/kategori.routes.js";
app.use("/api/kategori", kategoriRoutes);



