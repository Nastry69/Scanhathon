import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { scanRepo } from "../API/controllers/scanController.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Expose le dossier scans en static
router.use("/scans", express.static(path.join(__dirname, "../API/scans")));

// Route principale
router.post("/scan", scanRepo);

// Route test
router.get("/", (req, res) => {
  res.send("Scanner API running");
});

export default router;