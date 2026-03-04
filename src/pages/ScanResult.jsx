import React, { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import StatCard from "../components/StatCard";
import Tag from "../components/Tag";
import { jsPDF } from "jspdf";

const SEVERITY_MAP = {
  2: { label: "Critique", variant: "critical" },
  1: { label: "Élevée", variant: "high" },
  0: { label: "Moyenne", variant: "medium" },
};

const ScanResult = () => {
  const location = useLocation();
  const scanId = location.state?.scanId;
  const [eslintResult, setEslintResult] = useState(null);
  const [npmAuditResult, setNpmAuditResult] = useState(null);
  const [semgrepResult, setSemgrepResult] = useState(null);
  const [snykResult, setSnykResult] = useState(null);

  useEffect(() => {
    if (!scanId) return;
    fetch(`http://localhost:3001/scans/${scanId}/eslint.json`)
      .then(res => res.json())
      .then(setEslintResult);
    fetch(`http://localhost:3001/scans/${scanId}/npm-audit.json`)
      .then(res => res.json())
      .then(setNpmAuditResult);
    fetch(`http://localhost:3001/scans/${scanId}/semgrep.json`)
      .then(res => res.json())
      .then(setSemgrepResult)
      .catch(() => setSemgrepResult(null));
    fetch(`http://localhost:3001/scans/${scanId}/snyk.json`)
      .then(res => res.json())
      .then(setSnykResult)
      .catch(() => setSnykResult(null));
  }, [scanId]);

  // Mapping ESLint JSON → vulnérabilités
  const eslintVulns = useMemo(() => {
    if (!eslintResult) return [];
    return eslintResult
      .flatMap(file =>
        (file.messages || []).map(msg => ({
          id: `${file.filePath}:${msg.line}:${msg.column}`,
          severity: SEVERITY_MAP[msg.severity]?.label || "Info",
          severityVariant: SEVERITY_MAP[msg.severity]?.variant || "medium",
          title: msg.ruleId ? `Règle : ${msg.ruleId}` : "Alerte ESLint",
          code: msg.ruleId || "ESLINT",
          description: msg.message,
          file: file.filePath,
          line: msg.line,
        }))
      );
  }, [eslintResult]);

  // Mapping NPM Audit (exemple simplifié, à adapter selon ton format réel)
  const npmVulns = useMemo(() => {
    if (!npmAuditResult || !npmAuditResult.vulnerabilities) return [];
    return Object.values(npmAuditResult.vulnerabilities).map((v, idx) => ({
      id: v.name + idx,
      severity: v.severity === "critical" ? "Critique" : v.severity === "high" ? "Élevée" : "Moyenne",
      severityVariant: v.severity === "critical" ? "critical" : v.severity === "high" ? "high" : "medium",
      title: v.title || v.name,
      code: v.name,
      description: v.overview || v.via?.[0]?.title || v.severity,
    }));
  }, [npmAuditResult]);


  // Mapping Semgrep
  const semgrepVulns = useMemo(() => {
    if (!semgrepResult || !Array.isArray(semgrepResult.results)) return [];
    return semgrepResult.results.map((r, idx) => ({
      id: r.check_id + idx,
      severity: r.extra?.severity === "ERROR" ? "Critique" : r.extra?.severity === "WARNING" ? "Élevée" : "Moyenne",
      severityVariant: r.extra?.severity === "ERROR" ? "critical" : r.extra?.severity === "WARNING" ? "high" : "medium",
      title: r.check_id,
      code: r.check_id,
      description: r.extra?.message || r.path,
      file: r.path,
      line: r.start?.line,
    }));
  }, [semgrepResult]);

  // Mapping Snyk
  const snykVulns = useMemo(() => {
    if (!snykResult || !Array.isArray(snykResult.vulnerabilities)) return [];
    return snykResult.vulnerabilities.map((v, idx) => ({
      id: v.id + idx,
      severity: v.severity === "critical" ? "Critique" : v.severity === "high" ? "Élevée" : "Moyenne",
      severityVariant: v.severity === "critical" ? "critical" : v.severity === "high" ? "high" : "medium",
      title: v.title || v.name,
      code: v.id,
      description: v.description || v.overview || v.severity,
      file: v.moduleName,
      line: undefined,
    }));
  }, [snykResult]);

  // Fusionne toutes les vulnérabilités pour affichage
  const vulns = [
    ...eslintVulns,
    ...npmVulns,
    ...semgrepVulns,
    ...snykVulns,
  ];

  // Statistiques simples
  const stats = useMemo(() => {
    const crit = vulns.filter(v => v.severity === "Critique").length;
    const elev = vulns.filter(v => v.severity === "Élevée").length;
    const moy = vulns.filter(v => v.severity === "Moyenne").length;
    return { crit, elev, moy, total: vulns.length };
  }, [vulns]);

  // PDF (inchangé)
  const handleDownloadPdf = () => {/* ...conserve ton code PDF ici... */ };

  return (
    <div className="page-wrapper">
      <div id="rapport-pdf">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Résultats de l’analyse</h1>
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
            value={vulns.length === 0 ? "100/100" : `${Math.max(0, 100 - stats.crit * 20 - stats.elev * 10 - stats.moy * 5)}/100`}
            sub={vulns.length === 0 ? "Aucune vulnérabilité détectée" : `${stats.crit} Critique · ${stats.elev} Élevée · ${stats.moy} Moyenne`}
          />
          <StatCard
            label="Vulnérabilités"
            value={`${stats.crit.toString().padStart(2, "0")} Critique · ${stats.elev.toString().padStart(2, "0")} Élevée · ${stats.moy.toString().padStart(2, "0")} Moyenne`}
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
              {vulns.length === 0 && <p>Aucune vulnérabilité détectée !</p>}
              {vulns.map((v) => (
                <article key={v.id} className="vuln-item">
                  <div className="vuln-header">
                    <Tag variant={v.severityVariant}>{v.severity}</Tag>
                    <span className="vuln-id">{v.file ? `${v.file}` : "ID : "}{v.code}</span>
                  </div>
                  <h3 className="vuln-title">{v.title}</h3>
                  <p className="vuln-desc">{v.description}</p>
                  {v.line && <div className="vuln-meta">Ligne : {v.line}</div>}
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
                <p>Ajouter l’en-tête <code>Strict-Transport-Security</code> avec <code>max-age=63072000; includeSubDomains</code>.</p>
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