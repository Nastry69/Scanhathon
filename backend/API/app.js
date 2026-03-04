require('dotenv').config();
const cors = require("cors");
const express = require("express");
const { scanRepo } = require("./controllers/scanController");

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
}));
app.use(express.json());

// Route principale
app.post("/scan", scanRepo);

// verife
console.log('SEMGREP_APP_TOKEN chargé ?', !!process.env.SEMGREP_APP_TOKEN);
console.log('SNYK_TOKEN chargé ?', !!process.env.SNYK_TOKEN);

// Route test
app.get("/", (req, res) => {
  res.send("Scanner API running");
});

app.listen(3000, () => {
  console.log("Scanner API running on port 3000");
});