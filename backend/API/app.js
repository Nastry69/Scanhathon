const express = require("express");
const cors = require("cors");
const path = require("path");
const { scanRepo, getScanStatus } = require("./controllers/scanController");

const app = express();
app.use(cors());
app.use(express.json());

// Expose le dossier scans en static
app.use("/scans", express.static(path.join(__dirname, "scans")));

// Route principale
app.post("/scan", scanRepo);
app.get("/scan/status", getScanStatus);

// Route test
app.get("/", (req, res) => {
  res.send("Scanner API running");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Scanner API running on port ${PORT}`);
});