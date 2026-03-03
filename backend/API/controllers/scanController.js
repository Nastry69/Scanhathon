const { prepareRepo } = require("../services/repoService");
const { runNpmAudit } = require("../services/npmAuditService");
const { runEslint } = require("../services/eslintService");

async function scanRepo(req, res) {
  try {
    const { githubUrl } = req.body;

    if (!githubUrl) {
      return res.status(400).json({ error: "githubUrl required" });
    }

    // 1. Prépare le repo et récupère le scanId
    const { scanId, projectPath, repoPath } = await prepareRepo(githubUrl);
    console.log("Project path:", projectPath);

    // 2. Répond immédiatement au front
    res.json({ scanId });

    // 3. Lance l'analyse en tâche de fond
    setImmediate(async () => {
      try {
        await runNpmAudit(projectPath, scanId);
        await runEslint(projectPath, scanId);
        console.log(`Scan terminé pour ${scanId}`);
      } catch (err) {
        console.error(`Erreur lors du scan ${scanId}:`, err);
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Scan failed" });
  }
}

module.exports = { scanRepo };