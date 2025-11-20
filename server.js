import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Default route
app.get("/", (req, res) => {
  res.send("Backend Mushaf Krapyak ready!");
});

// Routes
import artikelRoutes from "./routes/artikel.routes.js";
app.use("/artikel", artikelRoutes);

import penulisRoutes from "./routes/penulis.routes.js";
app.use("/penulis", penulisRoutes);

import katalogRoutes from "./routes/katalog.routes.js";
app.use("/katalog", katalogRoutes);

import spekRoutes from "./routes/spek.routes.js";
app.use("/spek", spekRoutes);

import kategoriRoutes from "./routes/kategori.routes.js";
app.use("/kategori", kategoriRoutes);



export default app;
