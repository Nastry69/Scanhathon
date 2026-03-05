'use strict';

/**
 * scanParser.js
 * Normalise les JSON bruts des outils en lignes pour public.vulnerabilities
 *
 * IMPORTANT: l'enum vuln_severity en DB = ('critical','high','medium','low','info')
 * → on mappe 'moderate' sur 'medium'
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeSeverity(raw = '') {
  const s = raw.toLowerCase();
  if (s === 'critical')                                    return 'critical';
  if (['high', 'error'].includes(s))                      return 'high';
  if (['moderate', 'medium', 'warning'].includes(s))      return 'medium';
  if (s === 'low')                                         return 'low';
  return 'info';
}

function relativePath(absPath = '') {
  return absPath.replace(/^.*\/[0-9a-f-]{36}\//, '');
}

// ---------------------------------------------------------------------------
// Snyk
// ---------------------------------------------------------------------------
function parseSnyk(json, analysisId) {
  if (!json || json.ok || !json.vulnerabilities?.length) return [];

  return json.vulnerabilities.map(vuln => ({
    analysis_id:    analysisId,
    tool:           'snyk',
    severity:       normalizeSeverity(vuln.severity),
    title:          vuln.title ?? vuln.id,
    description:    vuln.description ?? null,
    file_path:      null,
    line_start:     null,
    code_snippet:   null,
    recommendation: vuln.fixedIn?.length
      ? `Upgrade to version ${vuln.fixedIn.join(' or ')}`
      : 'No fix available yet — consider removing or replacing the dependency.',
    raw: vuln,
  }));
}

// ---------------------------------------------------------------------------
// npm audit (auditReportVersion: 2)
// ---------------------------------------------------------------------------
function parseNpmAudit(json, analysisId) {
  if (!json) return [];
  const rows = [];

  for (const [pkgName, entry] of Object.entries(json.vulnerabilities ?? {})) {
    const advisories = entry.via.filter(v => typeof v === 'object');

    for (const advisory of advisories) {
      const fix = entry.fixAvailable;
      const recommendation = fix
        ? `Run: npm install ${fix.name}@${fix.version}${fix.isSemVerMajor ? '  ⚠️ major bump' : ''}`
        : 'No fix available — consider replacing the package.';

      rows.push({
        analysis_id:    analysisId,
        tool:           'npm_audit',
        severity:       normalizeSeverity(advisory.severity),
        title:          advisory.title ?? `Vulnerability in ${pkgName}`,
        description:    [
          advisory.url  ? `Advisory: ${advisory.url}` : null,
          advisory.cwe?.length ? `CWE: ${advisory.cwe.join(', ')}` : null,
          advisory.range ? `Affected range: ${advisory.range}` : null,
        ].filter(Boolean).join('\n'),
        file_path:      null,
        line_start:     null,
        code_snippet:   null,
        recommendation,
        raw: { package: pkgName, entry, advisory },
      });
    }
  }

  return rows;
}

// ---------------------------------------------------------------------------
// ESLint
// ---------------------------------------------------------------------------
function parseEslint(json, analysisId) {
  if (!Array.isArray(json)) return [];
  const rows = [];

  for (const fileResult of json) {
    const relPath = relativePath(fileResult.filePath);

    for (const msg of fileResult.messages) {
      const isFatalParseError = msg.fatal === true && !msg.ruleId;
      if (isFatalParseError) {
        rows.push({
          analysis_id:    analysisId,
          tool:           'eslint',
          severity:       'info',
          title:          `Parse error in ${relPath}`,
          description:    msg.message,
          file_path:      relPath,
          line_start:     msg.line ?? null,
          code_snippet:   null,
          recommendation: 'Add "sourceType: module" to your ESLint config (parserOptions).',
          raw: { filePath: fileResult.filePath, message: msg },
        });
        continue;
      }

      if (!msg.ruleId) continue;

      rows.push({
        analysis_id:    analysisId,
        tool:           'eslint',
        severity:       msg.severity === 2 ? 'high' : 'medium',
        title:          `ESLint rule violation: ${msg.ruleId}`,
        description:    msg.message,
        file_path:      relPath,
        line_start:     msg.line ?? null,
        code_snippet:   null,
        recommendation: `Fix rule: ${msg.ruleId}. See https://eslint.org/docs/rules/${msg.ruleId}`,
        raw: { filePath: fileResult.filePath, message: msg },
      });
    }
  }

  return rows;
}

// ---------------------------------------------------------------------------
// Semgrep
// ---------------------------------------------------------------------------
function parseSemgrep(json, analysisId) {
  if (!json) return [];

  return (json.results ?? []).map(finding => {
    const meta  = finding.extra?.metadata ?? {};
    const owasp = meta.owasp ?? [];
    const cwe   = Array.isArray(meta.cwe) ? meta.cwe : meta.cwe ? [meta.cwe] : [];

    const description = [
      finding.extra?.message,
      cwe.length   ? `CWE: ${cwe.join(' | ')}`      : null,
      owasp.length ? `OWASP: ${owasp.join(', ')}`   : null,
    ].filter(Boolean).join('\n');

    const refs = (meta.references ?? []).join('\n');

    return {
      analysis_id:    analysisId,
      tool:           'semgrep',
      severity:       normalizeSeverity(finding.extra?.severity ?? meta.confidence),
      title:          finding.check_id.split('.').pop().replace(/-/g, ' '),
      description,
      file_path:      relativePath(finding.path),
      line_start:     finding.start?.line ?? null,
      code_snippet:   finding.extra?.lines !== 'requires login' ? finding.extra?.lines : null,
      recommendation: refs || null,
      raw: finding,
    };
  });
}

// ---------------------------------------------------------------------------
// Orchestrateur
// ---------------------------------------------------------------------------
function parseAllScans({ snyk, npmAudit, eslint, semgrep }, analysisId) {
  return [
    ...parseSnyk(snyk, analysisId),
    ...parseNpmAudit(npmAudit, analysisId),
    ...parseEslint(eslint, analysisId),
    ...parseSemgrep(semgrep, analysisId),
  ];
}

module.exports = { parseAllScans, parseSnyk, parseNpmAudit, parseEslint, parseSemgrep };
