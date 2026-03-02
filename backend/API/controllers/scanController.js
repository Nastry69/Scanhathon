const { prepareRepo } = require("../services/repoService");
const { runNpmAudit } = require("../services/npmAuditService");

async function scanRepo(req, res) {
  try {
    const { githubUrl } = req.body;

    if (!githubUrl) {
      return res.status(400).json({ error: "githubUrl required" });
    }

    // 🟢 Récupère tout
    const { scanId, projectPath, repoPath } = await prepareRepo(githubUrl);
    console.log("Project path:", projectPath);

    // 🟢 Lance audit sur le BON dossier
    const auditResult = await runNpmAudit(projectPath, scanId);

    res.json({
      scanId,
      A03: auditResult,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Scan failed" });
  }
}

module.exports = { scanRepo };