// backend/API/controllers/scan.js

const { prepareRepo } = require('../services/repoService');
const { runNpmAudit } = require('../services/npmAuditService');
const { runSemgrep } = require('../services/semgrepService');

exports.scanRepo = async (req, res) => {
  try {
    const { githubUrl } = req.body;
    console.log('📥 Reçu githubUrl :', githubUrl);

    // Validation simple de l'URL
    if (!githubUrl || !githubUrl.startsWith('https://github.com/')) {
      return res.status(400).json({ error: 'Invalid githubUrl' });
    }

    // 1) Préparation du repo (clone + npm install/ci)
    const { projectPath, repoPath, scanId } = await prepareRepo(githubUrl);
    console.log('📦 prepareRepo OK →', { projectPath, repoPath, scanId });

    let npmAuditResult = null;
    let semgrepResult = null;

    // 2) npm audit - on ne fait PAS planter toute la route si ça casse
    try {
      npmAuditResult = await runNpmAudit(projectPath, scanId);
      console.log('✅ npm audit OK');
    } catch (e) {
      console.error('❌ npm audit failed:', e);
      npmAuditResult = {
        error: 'npm_audit_failed',
        message: e.message,
      };
    }

    // 3) Semgrep - pareil, on encapsule pour éviter un 500
    try {
      semgrepResult = await runSemgrep(projectPath, scanId);
      console.log('✅ semgrep OK');
    } catch (e) {
      console.error('❌ semgrep failed:', e);
      semgrepResult = {
        error: 'semgrep_failed',
        message: e.message,
      };
    }

    // 4) Réponse unifiée
    return res.json({
      scanId,
      projectPath,
      repoPath,
      npmAudit: npmAuditResult,
      semgrep: semgrepResult,
    });
  } catch (err) {
    console.error('🔥 Scan failed (global):', err);
    return res.status(500).json({
      error: 'Scan failed',
      message: err.message,
    });
  }
};