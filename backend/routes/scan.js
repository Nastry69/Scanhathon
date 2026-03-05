import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { scanRepo, scanZip } = require("../API/controllers/scanController.js");

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Expose le dossier scans en static
router.use("/scans", express.static(path.join(__dirname, "../API/scans")));

// Route principale (github)
router.post("/scan", scanRepo);

// Route pour le scan de fichiers zip
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB (ajuste si besoin)
});

router.post("/scan/zip", upload.single("zip"), scanZip);

// Route test
router.get("/", (req, res) => {
  res.send("Scanner API running");
});

export default router;