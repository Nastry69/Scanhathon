'use strict';

const fs = require('fs/promises');
const path = require('path');

const { prepareRepo, prepareZipFromBuffer } = require('../services/repoService');
const { runNpmAudit } = require('../services/npmAuditService');
const { runSemgrep } = require('../services/semgrepService');
const { runSnyk } = require('../services/snykService');
const { runEslint } = require('../services/eslintService');
const {
  createAnalysis,
  saveVulnerabilities,
  failAnalysis,
} = require('../services/dbService');

const inFlightScans = new Map();
const scanStatuses = new Map();

function getScanLockKey(githubUrl, userId) {
  return `${userId || 'anon'}::${githubUrl}`;
}

function updateScanStatus(lockKey, patch) {
  const current = scanStatuses.get(lockKey) || {
    progress: 0,
    stage: 'pending',
    message: 'En attente',
    startedAt: new Date().toISOString(),
  };
  scanStatuses.set(lockKey, {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  });
}

function clearScanStatusLater(lockKey, delayMs = 30000) {
  setTimeout(() => scanStatuses.delete(lockKey), delayMs);
}

exports.getScanStatus = (req, res) => {
  const { githubUrl, userId } = req.query;
  if (!githubUrl) {
    return res.status(400).json({ error: 'Missing githubUrl query parameter' });
  }

  const lockKey = getScanLockKey(githubUrl, userId);
  const status = scanStatuses.get(lockKey);
  if (!status) {
    return res.json({
      progress: 0,
      stage: 'idle',
      message: 'Aucun scan en cours',
      done: true,
    });
  }

  return res.json(status);
};

async function cleanupScanFolder(scanId) {
  const scanFolder = path.join(__dirname, '../scans', scanId);
  try {
    await fs.rm(scanFolder, { recursive: true, force: true });
    console.log(`[SCAN] Dossier de scan supprimé : ${scanFolder}`);
  } catch (e) {
    console.error(`[SCAN] Impossible de supprimer le dossier ${scanFolder}:`, e.message);
  }
}

exports.scanRepo = async (req, res) => {
  let analysisId = null;

  try {
    const { githubUrl, userId } = req.body;

    if (!githubUrl || !githubUrl.startsWith('https://github.com/')) {
      return res.status(400).json({ error: 'Invalid githubUrl' });
    }

    const lockKey = getScanLockKey(githubUrl, userId);
    if (inFlightScans.has(lockKey)) {
      console.log(`[SCAN] Requête dupliquée détectée, réutilisation du scan en cours pour ${lockKey}`);
      const existingResult = await inFlightScans.get(lockKey);
      return res.json(existingResult);
    }

    updateScanStatus(lockKey, {
      progress: 5,
      stage: 'starting',
      message: 'Initialisation du scan',
      done: false,
    });

    const scanPromise = (async () => {
      // 1) Création analyse DB (optionnel)
      if (userId) {
        try {
          analysisId = await createAnalysis(userId, githubUrl);
          console.log(`[SCAN] Analyse DB créée : ${analysisId}`);
        } catch (e) {
          console.error('[SCAN] Impossible de créer l’analyse en DB :', e.message);
        }
      }

      updateScanStatus(lockKey, {
        progress: 15,
        stage: 'preparing_repo',
        message: 'Clonage et préparation du repository',
      });

      // 2) Préparation repo
      console.log('[SCAN] Préparation du repo...');
      const { projectPath, repoPath, scanId } = await prepareRepo(githubUrl);
      console.log(`[SCAN] Repo prêt : ${projectPath}`);

      let npmAuditResult = null;
      let eslintResult = null;
      let semgrepResult = null;
      let snykResult = null;

      // 3) npm audit
      updateScanStatus(lockKey, {
        progress: 30,
        stage: 'npm_audit',
        message: 'Analyse des dépendances (npm audit)',
        scanId,
      });
      try {
        console.log(`[SCAN] Lancement npm audit pour ${scanId}`);
        npmAuditResult = await runNpmAudit(projectPath, scanId);
        console.log(`[SCAN] npm audit terminé pour ${scanId}`);
      } catch (e) {
        console.error(`[SCAN] Erreur npm audit pour ${scanId}:`, e);
        npmAuditResult = { error: 'npm_audit_failed', message: e.message };
      }

      // 4) ESLint
      updateScanStatus(lockKey, {
        progress: 45,
        stage: 'eslint',
        message: 'Analyse statique ESLint',
      });
      try {
        console.log(`[SCAN] Lancement ESLint pour ${scanId}`);
        eslintResult = await runEslint(projectPath, scanId);
        console.log(`[SCAN] ESLint terminé pour ${scanId}`);
      } catch (e) {
        console.error(`[SCAN] Erreur ESLint pour ${scanId}:`, e);
        eslintResult = { error: 'eslint_failed', message: e.message };
      }

      // 5) Semgrep
      updateScanStatus(lockKey, {
        progress: 60,
        stage: 'semgrep',
        message: 'Analyse SAST Semgrep',
      });
      try {
        console.log(`[SCAN] Lancement Semgrep pour ${scanId}`);
        semgrepResult = await runSemgrep(projectPath, scanId);
        console.log(`[SCAN] Semgrep terminé pour ${scanId}`);
      } catch (e) {
        console.error(`[SCAN] Erreur Semgrep pour ${scanId}:`, e);
        semgrepResult = { error: 'semgrep_failed', message: e.message };
      }

      // 6) Snyk
      updateScanStatus(lockKey, {
        progress: 75,
        stage: 'snyk',
        message: 'Analyse Snyk',
      });
      try {
        console.log(`[SCAN] Lancement Snyk pour ${scanId}`);
        snykResult = await runSnyk(projectPath, scanId);
        console.log(`[SCAN] Snyk terminé pour ${scanId}`);
      } catch (e) {
        console.error(`[SCAN] Erreur Snyk pour ${scanId}:`, e);
        snykResult = { error: 'snyk_failed', message: e.message };
      }

      // 7) Sauvegarde DB
      updateScanStatus(lockKey, {
        progress: 88,
        stage: 'db_save',
        message: 'Sauvegarde des résultats en base',
      });
      if (analysisId) {
        try {
          await saveVulnerabilities(analysisId, {
            snyk: snykResult,
            npmAudit: npmAuditResult,
            eslint: eslintResult,
            semgrep: semgrepResult,
          });
          console.log(`[SCAN] Vulnérabilités sauvegardées pour ${analysisId}`);

          // Les résultats sont persistés en DB : on peut supprimer les artefacts locaux.
          await cleanupScanFolder(scanId);
        } catch (e) {
          console.error('[SCAN] Erreur sauvegarde DB:', e);
          await failAnalysis(analysisId, e.message).catch(() => { });
        }
      }

      updateScanStatus(lockKey, {
        progress: 96,
        stage: 'cleanup',
        message: 'Finalisation du scan',
      });

      // 8) Réponse API
      const result = {
        scanId,
        analysisId,
        projectPath,
        repoPath,
        npmAudit: npmAuditResult,
        eslint: eslintResult,
        semgrep: semgrepResult,
        snyk: snykResult,
      };

      updateScanStatus(lockKey, {
        progress: 100,
        stage: 'completed',
        message: 'Scan terminé',
        done: true,
        result,
      });

      return result;
    })();

    inFlightScans.set(lockKey, scanPromise);

    const result = await scanPromise;
    return res.json(result);
  } catch (err) {
    console.error('[SCAN] Erreur générale du scan :', err);
    if (analysisId) await failAnalysis(analysisId, err.message).catch(() => { });
    return res.status(500).json({
      error: 'Scan failed',
      message: err.message,
    });
  } finally {
    const { githubUrl, userId } = req.body || {};
    if (githubUrl) {
      const lockKey = getScanLockKey(githubUrl, userId);
      inFlightScans.delete(lockKey);
      clearScanStatusLater(lockKey);
    }
  }
};

exports.scanZip = async (req, res) => {
  let analysisId = null;

  try {
    const { userId } = req.body;

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "zip file required (field name: zip)" });
    }

    // DB: on peut stocker un pseudo repo_url
    if (userId) {
      try {
        analysisId = await createAnalysis(userId, "zip_upload");
      } catch (e) {
        console.error("[SCAN ZIP] DB createAnalysis failed:", e);
      }
    }

    const { projectPath, repoPath, scanId } = await prepareZipFromBuffer(
      req.file.buffer,
      req.file.originalname
    );

    const result = await runAllTools({ projectPath, scanId });

    if (analysisId) {
      try {
        await saveVulnerabilities(analysisId, result);
      } catch (e) {
        console.error("[SCAN ZIP] DB saveVulnerabilities failed:", e);
        await failAnalysis(analysisId).catch(() => { });
      }
    }

    return res.json({ scanId, analysisId, projectPath, repoPath, ...result });
  } catch (err) {
    console.error("[SCAN ZIP] Error:", err);
    if (analysisId) await failAnalysis(analysisId).catch(() => { });
    return res.status(500).json({ error: "Scan failed", message: err.message });
  }
};

async function runAllTools({ projectPath, scanId }) {
  let npmAudit = null;
  let semgrep = null;
  let snyk = null;
  let eslint = null;

  try {
    npmAudit = await runNpmAudit(projectPath, scanId);
  } catch (e) {
    npmAudit = { error: "npm_audit_failed", message: e.message };
  }

  try {
    eslint = await runEslint(projectPath, scanId);
  } catch (e) {
    eslint = { error: "eslint_failed", message: e.message };
  }

  try {
    semgrep = await runSemgrep(projectPath, scanId);
  } catch (e) {
    semgrep = { error: "semgrep_failed", message: e.message };
  }

  try {
    snyk = await runSnyk(projectPath, scanId);
  } catch (e) {
    snyk = { error: "snyk_failed", message: e.message };
  }

  return { snyk, npmAudit, eslint, semgrep };
}
