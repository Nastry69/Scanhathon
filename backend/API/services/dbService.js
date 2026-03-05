'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });

const { createClient } = require('@supabase/supabase-js');
const { parseAllScans } = require('./scanParser');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Crée un enregistrement dans public.analyses avec status 'running'.
 * @param {string} userId  - UUID de l'utilisateur (auth.uid)
 * @param {string} repoUrl - URL GitHub du dépôt
 * @returns {Promise<string>} analysisId (UUID)
 */
async function createAnalysis(userId, repoUrl) {
  const repoName = repoUrl.replace(/\.git$/, '').split('/').pop();

  const { data, error } = await supabaseAdmin
    .from('analyses')
    .insert({ user_id: userId, repo_url: repoUrl, repo_name: repoName, status: 'running' })
    .select('id')
    .single();

  if (error) {
    console.error('[db] Erreur création analyse:', error);
    throw error;
  }

  console.log(`[db] Analyse créée : ${data.id}`);
  return data.id;
}

/**
 * Parse les résultats des 4 scanners et insère les vulnérabilités en DB,
 * puis met à jour le score et le status de l'analyse.
 *
 * @param {string} analysisId
 * @param {{ snyk, npmAudit, eslint, semgrep }} scanResults
 */
async function saveVulnerabilities(analysisId, scanResults) {
  const rows = parseAllScans(scanResults, analysisId);

  if (!rows.length) {
    console.log(`[db] Aucune vulnérabilité trouvée pour l'analyse ${analysisId}`);
    await updateAnalysisScore(analysisId, []);
    return { inserted: 0 };
  }

  const { data, error } = await supabaseAdmin
    .from('vulnerabilities')
    .insert(rows)
    .select('id');

  if (error) {
    console.error('[db] Erreur insertion vulnérabilités:', error);
    throw error;
  }

  console.log(`[db] ${data.length} vulnérabilités insérées pour l'analyse ${analysisId}`);
  await updateAnalysisScore(analysisId, rows);

  return { inserted: data.length };
}

/**
 * Poids par sévérité pour calculer le score (100 = parfait, 0 = critique).
 */
const SEVERITY_WEIGHTS = { critical: 25, high: 15, medium: 7, low: 3, info: 0 };

async function updateAnalysisScore(analysisId, rows) {
  const deduction = rows.reduce((sum, r) => sum + (SEVERITY_WEIGHTS[r.severity] ?? 0), 0);
  const score = Math.max(0, 100 - deduction);

  const { error } = await supabaseAdmin
    .from('analyses')
    .update({ score, status: 'completed' })
    .eq('id', analysisId);

  if (error) console.error('[db] Erreur mise à jour du score:', error);
  else console.log(`[db] Analyse ${analysisId} — score: ${score}/100`);
}

/**
 * Marque une analyse comme 'failed'.
 */
async function failAnalysis(analysisId) {
  await supabaseAdmin
    .from('analyses')
    .update({ status: 'failed' })
    .eq('id', analysisId);
}

module.exports = { createAnalysis, saveVulnerabilities, failAnalysis };
