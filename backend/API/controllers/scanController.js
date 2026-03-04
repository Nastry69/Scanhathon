// const { prepareRepo } = require("../services/repoService");
// const { runNpmAudit } = require("../services/npmAuditService");
// const { runEslint } = require("../services/eslintService");

// async function scanRepo(req, res) {
//   try {
//     const { githubUrl } = req.body;

//     if (!githubUrl) {
//       return res.status(400).json({ error: "githubUrl required" });
//     }

//     // 1. Prépare le repo et récupère le scanId
//     const { scanId, projectPath, repoPath } = await prepareRepo(githubUrl);
//     console.log("Project path:", projectPath);

//     // 2. Répond immédiatement au front
//     res.json({ scanId });

//     // 3. Lance l'analyse en tâche de fond
//     setImmediate(async () => {
//       try {
//         await runNpmAudit(projectPath, scanId);
//         await runEslint(projectPath, scanId);
//         console.log(`Scan terminé pour ${scanId}`);
//       } catch (err) {
//         console.error(`Erreur lors du scan ${scanId}:`, err);
//       }
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Scan failed" });
//   }
// }

// module.exports = { scanRepo };
// backend/API/controllers/scan.js

const { prepareRepo } = require('../services/repoService');
const { runNpmAudit } = require('../services/npmAuditService');
const { runSemgrep } = require('../services/semgrepService');
const { runSnyk } = require('../services/snykService');
const { runEslint } = require("../services/eslintService");

exports.scanRepo = async (req, res) => {
  try {
    const { githubUrl } = req.body;

    // Validation simple de l'URL
    if (!githubUrl || !githubUrl.startsWith('https://github.com/')) {
      return res.status(400).json({ error: 'Invalid githubUrl' });
    }

    // 1) Préparation du repo (clone + npm install/ci)
    const { projectPath, repoPath, scanId } = await prepareRepo(githubUrl);

    let npmAuditResult = null;
    let semgrepResult = null;
    let snykresult = null;
    let eslintResult = null;

    // 2) npm audit 
    try {
      npmAuditResult = await runNpmAudit(projectPath, scanId);
    } catch (e) {
      npmAuditResult = {
        error: 'npm_audit_failed',
        message: e.message,
      };
    }
    // 3) ESLint
    try {
      await runEslint(projectPath, scanId);
    } catch (e) {
      // On ignore les erreurs d'ESLint pour ne pas bloquer les autres analyses
      console.error(`ESLint failed for ${scanId}:`, e);
    }

    // 3) Semgrep 
    try {
      semgrepResult = await runSemgrep(projectPath, scanId);
    } catch (e) {
      semgrepResult = {
        error: 'semgrep_failed',
        message: e.message,
      };
    }

    // 4) SNYK
    try{
      snykresult = await runSnyk(projectPath, scanId);
    } catch (e) {
      snykresult = {
        error: 'snyk_failed',
        message: e.message,
      };
    }

    // 5) Réponse unifiée
    return res.json({
      scanId,
      projectPath,
      repoPath,
      npmAudit: npmAuditResult,
      eslint: eslintResult,
      semgrep: semgrepResult,
      snyk: snykresult,
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Scan failed',
      message: err.message,
    });
  }
};
