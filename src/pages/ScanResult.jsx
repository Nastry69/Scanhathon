import React, { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import StatCard from "../components/StatCard";
import Tag from "../components/Tag";
import { getVulnerabilities } from "../utils/api";

// ─── Mapping sévérité — miroir exact de normalizeSeverity() du backend ────────

// Utilisé pour les deux modes (fichiers et DB) pour garantir la cohérence
function normalizeSev(raw = '') {
  const s = String(raw).toLowerCase();
  if (s === 'critical')                                       return { label: "Critique", variant: "critical" };
  if (['high', 'error'].includes(s))                         return { label: "Élevée",   variant: "high" };
  if (['moderate', 'medium', 'warning'].includes(s))         return { label: "Moyenne",  variant: "medium" };
  if (s === 'low')                                           return { label: "Faible",   variant: "medium" };
  return { label: "Info", variant: "medium" };
}

// ESLint utilise 0/1/2 — aligné sur parseEslint() du backend
function normalizeSevEslint(severity) {
  if (severity === 2) return { label: "Élevée",  variant: "high" };
  if (severity === 1) return { label: "Moyenne", variant: "medium" };
  return { label: "Info", variant: "medium" };
}

const OWASP_A0 = {
  A03: "A03:2025",
  A04: "A04:2025",
  A05: "A05:2025",
};

function mapA0FromText(input = "") {
  const s = String(input).toLowerCase();
  if (/(sql|xss|inject|command injection|os command|child_process|child-process|nosql)/.test(s)) return OWASP_A0.A05;
  if (/(crypto|cryptographic|cipher|hash|md5|sha1|weak key|tls|certificate|cleartext|sensitive data)/.test(s)) return OWASP_A0.A04;
  if (/(dependency|supply chain|supply-chain|package|npm|yarn|pnpm|lockfile|postinstall|pipeline|ci\/cd)/.test(s)) return OWASP_A0.A03;
  return null;
}

function mapA0FromSemgrepOwaspTags(tags = []) {
  const t = tags.map(String).join(" ").toUpperCase();
  if (t.includes("A05:2025") || t.includes("A03:2021") || t.includes("A01:2017") || t.includes("A07:2017")) return OWASP_A0.A05;
  if (t.includes("A04:2025") || t.includes("A02:2021")) return OWASP_A0.A04;
  if (t.includes("A03:2025") || t.includes("A06:2021")) return OWASP_A0.A03;
  return null;
}

// ─── Composant ────────────────────────────────────────────────────────────────

// Poids identiques au backend (dbService.js)
const SEVERITY_SCORE_WEIGHTS = { Critique: 25, Élevée: 15, Moyenne: 7, Faible: 3, Info: 0 };

const ScanResult = () => {
  const location = useLocation();
  const scanId     = location.state?.scanId;      // mode fichiers (nouveau scan)
  const analysisId = location.state?.analysisId;  // mode DB (historique)
  const dbScore    = location.state?.dbScore;     // score déjà calculé en DB

  // --- Mode fichiers ---
  const [eslintResult,   setEslintResult]   = useState(null);
  const [npmAuditResult, setNpmAuditResult] = useState(null);
  const [semgrepResult,  setSemgrepResult]  = useState(null);
  const [snykResult,     setSnykResult]     = useState(null);

  // --- Mode DB ---
  const [dbVulns, setDbVulns] = useState(null);

  useEffect(() => {
    if (analysisId) {
      // Vient de l'historique → on charge depuis la DB
      getVulnerabilities(analysisId)
        .then(setDbVulns)
        .catch(() => setDbVulns([]));
      return;
    }

    if (!scanId) return;
    // Vient d'un nouveau scan → on charge les fichiers JSON
    fetch(`http://localhost:3001/scans/${scanId}/eslint.json`)
      .then(res => res.json()).then(setEslintResult).catch(() => {});
    fetch(`http://localhost:3001/scans/${scanId}/npm-audit.json`)
      .then(res => res.json()).then(setNpmAuditResult).catch(() => {});
    fetch(`http://localhost:3001/scans/${scanId}/semgrep.json`)
      .then(res => res.json()).then(setSemgrepResult).catch(() => setSemgrepResult(null));
    fetch(`http://localhost:3001/scans/${scanId}/snyk.json`)
      .then(res => res.json()).then(setSnykResult).catch(() => setSnykResult(null));
  }, [scanId, analysisId]);

  // ── Mapping fichiers → vulns ────────────────────────────────────────────────

  const eslintVulns = useMemo(() => {
    if (!eslintResult) return [];
    return eslintResult.flatMap(file =>
      (file.messages || []).map(msg => ({
        id: `${file.filePath}:${msg.line}:${msg.column}`,
        severity:        normalizeSevEslint(msg.severity).label,
        severityVariant: normalizeSevEslint(msg.severity).variant,
        title:       msg.ruleId ? `Règle : ${msg.ruleId}` : "Alerte ESLint",
        code:        msg.ruleId || "ESLINT",
        a0number:    mapA0FromText(`${msg.ruleId || ""} ${msg.message || ""}`),
        description: msg.message,
        file:        file.filePath,
        line:        msg.line,
      }))
    );
  }, [eslintResult]);

  const npmVulns = useMemo(() => {
    if (!npmAuditResult?.vulnerabilities) return [];
    // Miroir de parseNpmAudit() : on itère par advisory (via), pas par package
    return Object.values(npmAuditResult.vulnerabilities).flatMap((entry, pkgIdx) => {
      const advisories = (entry.via ?? []).filter(v => typeof v === 'object');
      if (!advisories.length) return [];
      return advisories.map((advisory, advIdx) => {
        const sev = normalizeSev(advisory.severity);
        return {
          id:              entry.name + pkgIdx + advIdx,
          severity:        sev.label,
          severityVariant: sev.variant,
          title:       advisory.title ?? `Vulnerability in ${entry.name}`,
          code:        entry.name,
          a0number:    OWASP_A0.A03,
          description: advisory.url ? `Advisory: ${advisory.url}` : advisory.severity,
        };
      });
    });
  }, [npmAuditResult]);

  const semgrepVulns = useMemo(() => {
    if (!semgrepResult || !Array.isArray(semgrepResult.results)) return [];
    return semgrepResult.results.map((r, idx) => {
      const sev = normalizeSev(r.extra?.severity ?? r.extra?.metadata?.confidence);
      return {
        id:              r.check_id + idx,
        severity:        sev.label,
        severityVariant: sev.variant,
        title:       r.check_id,
        code:        r.check_id,
        a0number:    mapA0FromSemgrepOwaspTags(Array.isArray(r.extra?.metadata?.owasp) ? r.extra.metadata.owasp : r.extra?.metadata?.owasp ? [r.extra.metadata.owasp] : [])
          ?? mapA0FromText(`${r.check_id} ${r.extra?.message || ""}`),
        description: r.extra?.message || r.path,
        file:        r.path,
        line:        r.start?.line,
      };
    });
  }, [semgrepResult]);

  const snykVulns = useMemo(() => {
    if (!snykResult || !Array.isArray(snykResult.vulnerabilities)) return [];
    return snykResult.vulnerabilities.map((v, idx) => {
      const sev = normalizeSev(v.severity);
      return {
        id:              v.id + idx,
        severity:        sev.label,
        severityVariant: sev.variant,
        title:       v.title || v.name,
        code:        v.id,
        a0number:    OWASP_A0.A03,
        description: v.description || v.overview || v.severity,
        file:        v.moduleName,
      };
    });
  }, [snykResult]);

  // ── Mapping DB → vulns ──────────────────────────────────────────────────────

  const dbMappedVulns = useMemo(() => {
    if (!dbVulns) return [];
    return dbVulns.map((v) => ({
      id:              v.id,
      severity:        normalizeSev(v.severity).label,
      severityVariant: normalizeSev(v.severity).variant,
      title:       v.title,
      code:        v.tool,
      a0number:    v.A0number ?? v.a0number,
      description: v.description,
      file:        v.file_path,
      line:        v.line_start,
      recommendation: v.recommendation,
    }));
  }, [dbVulns]);

  // ── Fusion finale ───────────────────────────────────────────────────────────

  const vulns = analysisId
    ? dbMappedVulns
    : [...eslintVulns, ...npmVulns, ...semgrepVulns, ...snykVulns];

  const stats = useMemo(() => {
    const crit = vulns.filter(v => v.severity === "Critique").length;
    const elev = vulns.filter(v => v.severity === "Élevée").length;
    const moy  = vulns.filter(v => v.severity === "Moyenne").length;
    // Score calculé comme le backend : déduction par vuln individuelle
    const computedScore = Math.max(
      0,
      100 - vulns.reduce((sum, v) => sum + (SEVERITY_SCORE_WEIGHTS[v.severity] ?? 0), 0)
    );
    // En mode historique on utilise le score stocké en DB, sinon le score calculé
    const score = dbScore ?? computedScore;
    return { crit, elev, moy, total: vulns.length, score };
  }, [vulns, dbScore]);

  const handleDownloadPdf = () => {};

  return (
    <div className="page-wrapper">
      <div id="rapport-pdf">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Résultats de l'analyse</h1>
            <p className="page-subtitle">
              Visualisez les vulnérabilités détectées sur ce dépôt.
            </p>
          </div>
          <button className="btn-primary" onClick={handleDownloadPdf}>
            Télécharger le rapport PDF
          </button>
        </div>
        <div className="grid-3">
          <StatCard
            label="Score global"
            value={`${stats.score}/100`}
            sub={stats.total === 0 ? "Aucune vulnérabilité détectée" : `${stats.crit} Critique · ${stats.elev} Élevée · ${stats.moy} Moyenne`}
          />
          <StatCard
            label="Vulnérabilités"
            value={`${String(stats.crit).padStart(2, "0")} Critique · ${String(stats.elev).padStart(2, "0")} Élevée · ${String(stats.moy).padStart(2, "0")} Moyenne`}
            sub={`${stats.total} vulnérabilités au total détectées.`}
          />
          <div className="card compliance-card">
            <div className="stat-label">Statut de conformité</div>
            <div className="stat-value">{vulns.length === 0 ? "Conforme" : "Partiellement conforme"}</div>
            <div className="stat-sub">
              Évaluation basée sur les standards ISO 27001 et OWASP.
            </div>
            <button
              className="btn-link"
              onClick={() => window.open("https://owasp.org/Top10/2021/fr/index.html", "_blank")}
            >
              Voir le détail OWASP →
            </button>
          </div>
        </div>
        <div className="result-layout">
          <section className="card vulns-card">
            <div className="card-header">
              <h2 className="section-title">Vulnérabilités détectées</h2>
              <div className="card-header-actions">
                <button className="btn-chip">Trier par : Sévérité</button>
                <button className="btn-chip">Filtrer</button>
              </div>
            </div>
            <div className="vuln-list">
              {vulns.length === 0 && (
                <p>{analysisId && !dbVulns ? "Chargement…" : "Aucune vulnérabilité détectée !"}</p>
              )}
              {vulns.map((v) => (
                <article key={v.id} className="vuln-item">
                  <div className="vuln-header">
                    <Tag variant={v.severityVariant}>{v.severity}</Tag>
                    <span className="vuln-id">{v.file ? `${v.file} ` : ""}{v.code}</span>
                  </div>
                  <h3 className="vuln-title">{v.title}</h3>
                  <p className="vuln-desc">{v.description}</p>
                  {v.a0number && <div className="vuln-meta">OWASP: {v.a0number}</div>}
                  {v.line && <div className="vuln-meta">Ligne : {v.line}</div>}
                  {v.recommendation && <div className="vuln-meta">{v.recommendation}</div>}
                </article>
              ))}
            </div>
          </section>
          <aside className="card fixes-card">
            <h2 className="section-title">Corrections suggérées</h2>
            <p className="fixes-subtitle">Basé sur OWASP Top 10</p>
            <ul className="fixes-list">
              <li>
                <strong>A03:2021-Injection</strong>
                <p>Utiliser des requêtes paramétrées (Prepared Statements) pour toutes les interactions avec la base de données.</p>
                <pre className="code-block">
                  <code>{`$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");`}</code>
                </pre>
              </li>
              <li>
                <strong>A02:2021-Cryptographic Failures</strong>
                <p>Mettre à jour les algorithmes de hachage vers Argon2id ou bcrypt avec un coût minimal de 12.</p>
              </li>
              <li>
                <strong>A05:2021-Security Misconf.</strong>
                <p>Ajouter l'en-tête <code>Strict-Transport-Security</code> avec <code>max-age=63072000; includeSubDomains</code>.</p>
              </li>
            </ul>
            <button className="btn-secondary">Voir le guide complet de remédiation</button>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ScanResult;



