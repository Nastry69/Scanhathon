'use strict';

require('dotenv').config({
  path: require('path').join(__dirname, '../../../.env'),
});

const { createClient } = require('@supabase/supabase-js');
const { parseAllScans } = require('./scanParser');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SEVERITY_WEIGHTS = {
  critical: 25,
  high: 15,
  medium: 7,
  low: 3,
  info: 0,
};

function extractRepoName(repoUrl = '') {
  const clean = String(repoUrl).trim().replace(/\/+$/, '');
  if (!clean) return '';
  const parts = clean.split('/');
  return parts[parts.length - 1] || clean;
}

async function createAnalysis(userId, repoUrl, branch = 'main') {
  const payload = {
    user_id: userId,
    repo_url: repoUrl,
    repo_name: extractRepoName(repoUrl),
    branch,
    status: 'running',
    score: null,
  };

  const { data, error } = await supabaseAdmin
    .from('analyses')
    .insert([payload])
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

async function updateAnalysisScore(analysisId, vulnerabilities = []) {
  const penalty = vulnerabilities.reduce((sum, v) => {
    const sev = String(v.severity || '').toLowerCase();
    return sum + (SEVERITY_WEIGHTS[sev] ?? 0);
  }, 0);

  const score = Math.max(0, 100 - penalty);

  const { error } = await supabaseAdmin
    .from('analyses')
    .update({
      score,
      status: 'completed', // <-- mettre une valeur existante dans analysis_status
    })
    .eq('id', analysisId);

  if (error) throw error;
  return { score, status: 'completed' };
}


async function failAnalysis(analysisId, reason = null) {
  const payload = { status: 'failed' };
  if (reason) payload.error_message = String(reason).slice(0, 2000);

  const { error } = await supabaseAdmin
    .from('analyses')
    .update(payload)
    .eq('id', analysisId);

  if (error) throw error;
}

async function saveVulnerabilities(analysisId, input) {
  // input peut être:
  // - un tableau déjà normalisé
  // - un objet { snyk, npmAudit, eslint, semgrep }
  const vulnerabilities = Array.isArray(input)
    ? input
    : parseAllScans(input || {}, analysisId);

  if (!Array.isArray(vulnerabilities)) {
    throw new TypeError('saveVulnerabilities: vulnerabilities doit être un tableau');
  }

  // Ensure column casing matches DB schema ("A0number").
  const vulnerabilitiesForInsert = vulnerabilities.map((v) => {
    const a0 = v.A0number ?? v.a0number ?? null;
    const row = { ...v, A0number: a0 };
    delete row.a0number;
    return row;
  });

  if (vulnerabilitiesForInsert.length === 0) {
    await updateAnalysisScore(analysisId, []);
    return { inserted: 0 };
  }

  const { data, error } = await supabaseAdmin
    .from('vulnerabilities')
    .insert(vulnerabilitiesForInsert)
    .select('id');

  if (error) throw error;

  await updateAnalysisScore(analysisId, vulnerabilitiesForInsert);
  return { inserted: data?.length ?? vulnerabilitiesForInsert.length };
}

async function getVulnerabilities(analysisId) {
  const { data, error } = await supabaseAdmin
    .from('vulnerabilities')
    .select('*')
    .eq('analysis_id', analysisId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

async function getAnalyses() {
  const { data, error } = await supabaseAdmin
    .from('analyses_summary')
    .select(`
      id,
      repo_name,
      repo_url,
      branch,
      status,
      score,
      created_at,
      total_vulns,
      critical_count,
      high_count,
      medium_count,
      low_count,
      info_count,
      a03_count,
      a04_count,
      a05_count
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

module.exports = {
  createAnalysis,
  saveVulnerabilities,
  updateAnalysisScore,
  failAnalysis,
  getVulnerabilities,
  getAnalyses,
};