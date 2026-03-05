import React, { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import StatCard from "../components/StatCard";
import Tag from "../components/Tag";
import { getVulnerabilities } from "../utils/api";
import { jsPDF } from "jspdf";

// ─── Mapping sévérité — miroir exact de normalizeSeverity() du backend ────────

// Utilisé pour les deux modes (fichiers et DB) pour garantir la cohérence
function normalizeSev(raw = '') {
  const s = String(raw).toLowerCase();
  if (s === 'critical') return { label: "Critique", variant: "critical" };
  if (['high', 'error'].includes(s)) return { label: "Élevée", variant: "high" };
  if (['moderate', 'medium', 'warning'].includes(s)) return { label: "Moyenne", variant: "medium" };
  if (s === 'low') return { label: "Faible", variant: "medium" };
  return { label: "Info", variant: "medium" };
}

// ESLint utilise 0/1/2 — aligné sur parseEslint() du backend
function normalizeSevEslint(severity) {
  if (severity === 2) return { label: "Élevée", variant: "high" };
  if (severity === 1) return { label: "Moyenne", variant: "medium" };
  return { label: "Info", variant: "medium" };
}

// ─── Composant ────────────────────────────────────────────────────────────────

// Poids identiques au backend (dbService.js)
const SEVERITY_SCORE_WEIGHTS = { Critique: 25, Élevée: 15, Moyenne: 7, Faible: 3, Info: 0 };

const ScanResult = () => {
  const location = useLocation();
  const scanId = location.state?.scanId;      // mode fichiers (nouveau scan)
  const analysisId = location.state?.analysisId;  // mode DB (historique)
  const dbScore = location.state?.dbScore;     // score déjà calculé en DB

  // 1) Source URL repo : priorité DB (historique), sinon state (nouveau scan)
const githubUrl = location.state?.githubUrl;     // nouveau scan
const repoUrlFromDb = location.state?.repo_url;  // historique si tu l'as déjà dans state (sinon on fetch plus tard)

// 2) URL finale utilisée pour le nom du repo
const repoUrl = repoUrlFromDb || githubUrl || "";

// 3) Nom du repo
const repoName = (() => {
  if (!repoUrl) return "Repository inconnu";
  const clean = repoUrl.replace(/\.git$/, "").replace(/\/+$/, "");
  const parts = clean.split("/");
  return parts.length >= 2 ? parts.slice(-2).join("/") : "Repository inconnu";
})();

  // --- Mode fichiers ---
  const [eslintResult, setEslintResult] = useState(null);
  const [npmAuditResult, setNpmAuditResult] = useState(null);
  const [semgrepResult, setSemgrepResult] = useState(null);
  const [snykResult, setSnykResult] = useState(null);

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
      .then(res => res.json()).then(setEslintResult).catch(() => { });
    fetch(`http://localhost:3001/scans/${scanId}/npm-audit.json`)
      .then(res => res.json()).then(setNpmAuditResult).catch(() => { });
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
        severity: normalizeSevEslint(msg.severity).label,
        severityVariant: normalizeSevEslint(msg.severity).variant,
        title: msg.ruleId ? `Règle : ${msg.ruleId}` : "Alerte ESLint",
        code: msg.ruleId || "ESLINT",
        description: msg.message,
        file: file.filePath,
        line: msg.line,
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
          id: entry.name + pkgIdx + advIdx,
          severity: sev.label,
          severityVariant: sev.variant,
          title: advisory.title ?? `Vulnerability in ${entry.name}`,
          code: entry.name,
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
        id: r.check_id + idx,
        severity: sev.label,
        severityVariant: sev.variant,
        title: r.check_id,
        code: r.check_id,
        description: r.extra?.message || r.path,
        file: r.path,
        line: r.start?.line,
      };
    });
  }, [semgrepResult]);

  const snykVulns = useMemo(() => {
    if (!snykResult || !Array.isArray(snykResult.vulnerabilities)) return [];
    return snykResult.vulnerabilities.map((v, idx) => {
      const sev = normalizeSev(v.severity);
      return {
        id: v.id + idx,
        severity: sev.label,
        severityVariant: sev.variant,
        title: v.title || v.name,
        code: v.id,
        description: v.description || v.overview || v.severity,
        file: v.moduleName,
      };
    });
  }, [snykResult]);

  // ── Mapping DB → vulns ──────────────────────────────────────────────────────

  const dbMappedVulns = useMemo(() => {
    if (!dbVulns) return [];
    return dbVulns.map((v) => ({
      id: v.id,
      severity: normalizeSev(v.severity).label,
      severityVariant: normalizeSev(v.severity).variant,
      title: v.title,
      code: v.tool,
      description: v.description,
      file: v.file_path,
      line: v.line_start,
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
    const moy = vulns.filter(v => v.severity === "Moyenne").length;
    // Score calculé comme le backend : déduction par vuln individuelle
    const computedScore = Math.max(
      0,
      100 - vulns.reduce((sum, v) => sum + (SEVERITY_SCORE_WEIGHTS[v.severity] ?? 0), 0)
    );
    // En mode historique on utilise le score stocké en DB, sinon le score calculé
    const score = dbScore ?? computedScore;
    return { crit, elev, moy, total: vulns.length, score };
  }, [vulns, dbScore]);


  // ── Télécharger en PDF ───────────────────────────────────────────────────────
  const handleDownloadPdf = () => {
    try {
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const vulnerabilities = Array.isArray(vulns) ? vulns : [];
      const analysisDate = new Date().toLocaleString("fr-FR");

      const PAGE_W = 210;
      const PAGE_H = 297;
      const M = 14;
      const BAND_H = 18;
      const CARD_W = PAGE_W - 2 * M;

      // ---------- helpers ----------
      const hexToRgb = (hex) => {
        const h = String(hex).replace("#", "");
        const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
        const n = parseInt(full, 16);
        return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
      };

      const setFillHex = (hex) => {
        const { r, g, b } = hexToRgb(hex);
        doc.setFillColor(r, g, b);
      };

      const setTextHex = (hex) => {
        const { r, g, b } = hexToRgb(hex);
        doc.setTextColor(r, g, b);
      };

      const wrap = (text, maxW, size) => {
        doc.setFontSize(size);
        return doc.splitTextToSize(String(text ?? ""), maxW);
      };

      const severityBadge = (raw) => {
        const s = String(raw ?? "").toLowerCase();
        if (["critique", "critical"].includes(s)) return { label: "Critique", bg: "#8B0000", fg: "#FFFFFF" };
        if (["élevée", "elevee", "high", "error"].includes(s)) return { label: "Élevée", bg: "#D9534F", fg: "#FFFFFF" };
        if (["moyenne", "medium", "moderate", "warning"].includes(s)) return { label: "Moyenne", bg: "#F0AD4E", fg: "#1A1A1A" };
        if (["faible", "low"].includes(s)) return { label: "Faible", bg: "#5CB85C", fg: "#FFFFFF" };
        return { label: raw || "Info", bg: "#6C757D", fg: "#FFFFFF" };
      };

      const drawHeader = () => {
        setFillHex("#1B4D34");
        doc.rect(0, 0, PAGE_W, BAND_H, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.text("Rapport d'analyse - Vulnérabilités", M, 12);

        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
      };

      const addPage = () => {
        doc.addPage();
        drawHeader();
        return BAND_H + 10;
      };

      const drawBadge = (x, y, text, bg, fg) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);

        const paddingX = 3;
        const badgeH = 7;
        const w = doc.getTextWidth(text) + paddingX * 2;

        setFillHex(bg);
        doc.roundedRect(x, y - badgeH + 1, w, badgeH, 2, 2, "F");

        setTextHex(fg);
        doc.text(text, x + paddingX, y);

        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
        return w;
      };

      const drawCard = (x, y, v) => {
        const severity = v.severity ?? "";
        const { label, bg, fg } = severityBadge(severity);

        const tool = v.code || v.tool || v.category || "Tool";
        const title = v.title || v.message || "Vulnérabilité";
        const desc = v.description || "";
        const file = v.file || v.filePath || v.path || "";
        const line = v.line ?? "";

        const padX = 6;
        const padTop = 6;
        const textW = CARD_W - padX * 2;

        // prépare lignes
        const titleLines = wrap(title, textW, 11);
        const toolLine = `Catégorie : ${tool}`;
        const lineLine = line ? `Ligne : ${line}` : "";
        const fileLine = file ? `Fichier : ${file}` : "";

        const toolLines = wrap(toolLine, textW, 9);
        const descLines = desc ? wrap(desc, textW, 9) : [];
        const lineLines = lineLine ? wrap(lineLine, textW, 9) : [];
        const fileLines = fileLine ? wrap(fileLine, textW, 9) : [];

        const linesCount =
          titleLines.length * 5 +
          toolLines.length * 4.6 +
          descLines.length * 4.6 +
          lineLines.length * 4.6 +
          fileLines.length * 4.6;

        const cardH = 16 + linesCount / 1 + 8; // simple estimation

        // background
        doc.setDrawColor(35, 45, 60);
        doc.setLineWidth(0.4);
        doc.setFillColor(18, 25, 35);
        doc.roundedRect(x, y, CARD_W, cardH, 3, 3, "FD");

        // badge
        drawBadge(x + padX, y + padTop + 3, label, bg, fg);

        // contenu
        let ty = y + padTop + 12;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);
        titleLines.forEach((l) => {
          doc.text(l, x + padX, ty);
          ty += 5;
        });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(200, 210, 220);

        toolLines.forEach((l) => {
          doc.text(l, x + padX, ty);
          ty += 4.6;
        });

        if (descLines.length) {
          ty += 1.5;
          descLines.forEach((l) => {
            doc.text(l, x + padX, ty);
            ty += 4.6;
          });
        }

        if (lineLines.length) {
          ty += 1.5;
          lineLines.forEach((l) => {
            doc.text(l, x + padX, ty);
            ty += 4.6;
          });
        }

        if (fileLines.length) {
          ty += 1.5;
          doc.setTextColor(160, 175, 190);
          fileLines.forEach((l) => {
            doc.text(l, x + padX, ty);
            ty += 4.2;
          });
        }

        doc.setTextColor(0, 0, 0);
        return cardH;
      };

      // ---------- build pdf ----------
      drawHeader();

      let y = BAND_H + 12;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Repository : ${repoName}`, M, y);
      y += 6;

      doc.text(`Date de l'analyse : ${analysisDate}`, M, y);
      y += 8;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`Vulnérabilités détectées : ${vulnerabilities.length}`, M, y);
      y += 8;

      for (const v of vulnerabilities) {
        if (y + 55 > PAGE_H - M) y = addPage();
        const cardH = drawCard(M, y, v);
        y += cardH + 8;
        if (y > PAGE_H - M) y = addPage();
      }

      doc.save("rapport_scan.pdf");
    } catch (e) {
      console.error("PDF ERROR:", e);
      alert("Erreur génération PDF (voir console)");
    }
  };

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
            value={`${stats.total}/100`}
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
