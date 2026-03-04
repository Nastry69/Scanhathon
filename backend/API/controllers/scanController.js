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
const { createAnalysis, saveVulnerabilities, failAnalysis } = require('../services/dbService');

exports.scanRepo = async (req, res) => {
  let analysisId = null;

  try {
    const { githubUrl, userId } = req.body;

    // Validation simple de l'URL
    if (!githubUrl || !githubUrl.startsWith('https://github.com/')) {
      return res.status(400).json({ error: 'Invalid githubUrl' });
    }

    // 1) Création de l'enregistrement analyse en DB (si utilisateur connecté)
    if (userId) {
      try {
        analysisId = await createAnalysis(userId, githubUrl);
        console.log(`[SCAN] Analyse DB créée : ${analysisId}`);
      } catch (e) {
        console.error('[SCAN] Impossible de créer l\'analyse en DB:', e);
        // On continue sans DB plutôt que de bloquer le scan
      }
    }

    // 2) Préparation du repo (clone + npm install/ci)
    console.log('[SCAN] Préparation du repo...');
    const { projectPath, repoPath, scanId } = await prepareRepo(githubUrl);
    console.log(`[SCAN] Repo prêt : ${projectPath}`);

    let npmAuditResult = null;
    let semgrepResult = null;
    let snykresult = null;
    let eslintResult = null;

    // 3) npm audit
    try {
      console.log(`[SCAN] Lancement npm audit pour ${scanId}`);
      npmAuditResult = await runNpmAudit(projectPath, scanId);
      console.log(`[SCAN] npm audit terminé pour ${scanId}`);
    } catch (e) {
      console.error(`[SCAN] Erreur npm audit pour ${scanId}:`, e);
      npmAuditResult = { error: 'npm_audit_failed', message: e.message };
    }

    // 4) ESLint
    try {
      console.log(`[SCAN] Lancement ESLint pour ${scanId}`);
      eslintResult = await runEslint(projectPath, scanId);
      console.log(`[SCAN] ESLint terminé pour ${scanId}`);
    } catch (e) {
      console.error(`[SCAN] ESLint failed for ${scanId}:`, e);
    }

    // 5) Semgrep
    try {
      console.log(`[SCAN] Lancement Semgrep pour ${scanId}`);
      semgrepResult = await runSemgrep(projectPath, scanId);
      console.log(`[SCAN] Semgrep terminé pour ${scanId}`);
    } catch (e) {
      console.error(`[SCAN] Erreur Semgrep pour ${scanId}:`, e);
      semgrepResult = { error: 'semgrep_failed', message: e.message };
    }

    // 6) Snyk
    try {
      console.log(`[SCAN] Lancement Snyk pour ${scanId}`);
      snykresult = await runSnyk(projectPath, scanId);
      console.log(`[SCAN] Snyk terminé pour ${scanId}`);
    } catch (e) {
      console.error(`[SCAN] Erreur Snyk pour ${scanId}:`, e);
      snykresult = { error: 'snyk_failed', message: e.message };
    }

    // 7) Sauvegarde en DB (vulnérabilités + score)
    if (analysisId) {
      try {
        await saveVulnerabilities(analysisId, {
          snyk:     snykresult,
          npmAudit: npmAuditResult,
          eslint:   eslintResult,
          semgrep:  semgrepResult,
        });
        console.log(`[SCAN] Vulnérabilités sauvegardées pour l'analyse ${analysisId}`);
      } catch (e) {
        console.error('[SCAN] Erreur sauvegarde DB:', e);
        await failAnalysis(analysisId).catch(() => {});
      }
    }

    // 8) Réponse unifiée
    return res.json({
      scanId,
      analysisId,
      projectPath,
      repoPath,
      npmAudit: npmAuditResult,
      eslint: eslintResult,
      semgrep: semgrepResult,
      snyk: snykresult,
    });
  } catch (err) {
    console.error('[SCAN] Erreur générale du scan :', err);
    if (analysisId) await failAnalysis(analysisId).catch(() => {});
    return res.status(500).json({
      error: 'Scan failed',
      message: err.message,
    });
  }
};
