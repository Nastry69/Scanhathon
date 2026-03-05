'use strict';

const { prepareRepo } = require('../services/repoService');
const { runNpmAudit } = require('../services/npmAuditService');
const { runSemgrep } = require('../services/semgrepService');
const { runSnyk } = require('../services/snykService');
const { runEslint } = require('../services/eslintService');
const {
  createAnalysis,
  saveVulnerabilities,
  failAnalysis,
} = require('../services/dbService');

exports.scanRepo = async (req, res) => {
  let analysisId = null;

  try {
    const { githubUrl, userId } = req.body;

    if (!githubUrl || !githubUrl.startsWith('https://github.com/')) {
      return res.status(400).json({ error: 'Invalid githubUrl' });
    }

    // 1) Création analyse DB (optionnel)
    if (userId) {
      try {
        analysisId = await createAnalysis(userId, githubUrl);
        console.log(`[SCAN] Analyse DB créée : ${analysisId}`);
      } catch (e) {
        console.error('[SCAN] Impossible de créer l’analyse en DB :', e.message);
      }
    }

    // 2) Préparation repo
    console.log('[SCAN] Préparation du repo...');
    const { projectPath, repoPath, scanId } = await prepareRepo(githubUrl);
    console.log(`[SCAN] Repo prêt : ${projectPath}`);

    let npmAuditResult = null;
    let eslintResult = null;
    let semgrepResult = null;
    let snykResult = null;

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
      console.error(`[SCAN] Erreur ESLint pour ${scanId}:`, e);
      eslintResult = { error: 'eslint_failed', message: e.message };
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
      snykResult = await runSnyk(projectPath, scanId);
      console.log(`[SCAN] Snyk terminé pour ${scanId}`);
    } catch (e) {
      console.error(`[SCAN] Erreur Snyk pour ${scanId}:`, e);
      snykResult = { error: 'snyk_failed', message: e.message };
    }

    // 7) Sauvegarde DB
    if (analysisId) {
      try {
        await saveVulnerabilities(analysisId, {
          snyk: snykResult,
          npmAudit: npmAuditResult,
          eslint: eslintResult,
          semgrep: semgrepResult,
        });
        console.log(`[SCAN] Vulnérabilités sauvegardées pour ${analysisId}`);
      } catch (e) {
        console.error('[SCAN] Erreur sauvegarde DB:', e);
        await failAnalysis(analysisId, e.message).catch(() => {});
      }
    }

    // 8) Réponse API
    return res.json({
      scanId,
      analysisId,
      projectPath,
      repoPath,
      npmAudit: npmAuditResult,
      eslint: eslintResult,
      semgrep: semgrepResult,
      snyk: snykResult,
    });
  } catch (err) {
    console.error('[SCAN] Erreur générale du scan :', err);
    if (analysisId) await failAnalysis(analysisId, err.message).catch(() => {});
    return res.status(500).json({
      error: 'Scan failed',
      message: err.message,
    });
  }
};