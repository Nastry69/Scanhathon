import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import StatCard from "../components/StatCard";
import Tag from "../components/Tag";
import { jsPDF } from "jspdf";


/** Page Résultat du scan */
const ScanResult = () => {
  const location = useLocation();
  const scanId = location.state?.scanId;
  const [eslintResult, setEslintResult] = useState(null);
  const [npmAuditResult, setNpmAuditResult] = useState(null);

  useEffect(() => {
    if (!scanId) return;
    fetch(`http://localhost:3001/scans/${scanId}/eslint.json`)
      .then(res => res.json())
      .then(setEslintResult);
    fetch(`http://localhost:3001/scans/${scanId}/npm-audit.json`)
      .then(res => res.json())
      .then(setNpmAuditResult);
  }, [scanId]);
  return (
    <div className="page-wrapper">
      <h1>Résultat du scan</h1>
      <h2>ESLint</h2>
      <pre>{eslintResult ? JSON.stringify(eslintResult, null, 2) : "Chargement..."}</pre>
      <h2>NPM Audit</h2>
      <pre>{npmAuditResult ? JSON.stringify(npmAuditResult, null, 2) : "Chargement..."}</pre>
    </div>
  );

  return (
    <div className="page-wrapper">
      {/* En-tête de page : titre + description + action principale */}
      <div id="rapport-pdf">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Résultats de l’analyse</h1>
            <p className="page-subtitle">
              Visualisez les vulnérabilités détectées sur ce dépôt.
            </p>
          </div>
          {/* CTA principal : export du rapport sous forme de PDF */}
          <button className="btn-primary" onClick={handleDownloadPdf}>
            Télécharger le rapport PDF</button>
        </div>


        {/* Résumé des métriques principales sous forme de cartes */}
        <div className="grid-3">
          <StatCard
            label="Score global"
            value="72/100"
            sub="Amélioration de 3 points depuis l’analyse précédente (24 Octobre)"
          />
          <StatCard
            label="Vulnérabilités"
            value="03 Critique · 05 Élevée · 04 Moyenne"
            sub="12 vulnérabilités au total détectées."
          />

          {/* Carte spécifique pour le statut de conformité (sans StatCard) */}
          <div className="card compliance-card">
            <div className="stat-label">Statut de conformité</div>
            <div className="stat-value">Partiellement conforme</div>
            <div className="stat-sub">
              Évaluation basée sur les standards ISO 27001 et OWASP.
            </div>
            <button
              className="btn-link"
              onClick={() =>
                window.open(
                  "https://owasp.org/Top10/2021/fr/index.html",
                  "_blank")}>
              Voir le détail OWASP →
            </button>
          </div>
        </div>

        {/* Layout principal : liste des vulnérabilités + panneau de remédiation */}
        <div className="result-layout">

          {/* Colonne gauche : vulnérabilités détectées */}
          <section className="card vulns-card">
            <div className="card-header">
              <h2 className="section-title">Vulnérabilités détectées</h2>
              <div className="card-header-actions">

                {/* Boutons prévus pour des fonctionnalités futures (tri, filtres) */}
                <button className="btn-chip">Trier par : Sévérité</button>
                <button className="btn-chip">Filtrer</button>
              </div>
            </div>

            {/* À remplacer par un appel API. */}
            <div className="vuln-list">
              {vulns.map((v) => (
                <article key={v.id} className="vuln-item">
                  <div className="vuln-header">

                    {/* Tag de sévérité : style dépend du variant */}
                    <Tag variant={v.severityVariant}>{v.severity}</Tag>
                    <span className="vuln-id">ID : {v.code}</span>
                  </div>

                  {/* Titre + description de la vulnérabilité */}
                  <h3 className="vuln-title">{v.title}</h3>
                  <p className="vuln-desc">{v.description}</p>
                </article>
              ))}
            </div>
          </section>

          {/* Colonne droite : recommandations de remédiation */}
          <aside className="card fixes-card">
            <h2 className="section-title">Corrections suggérées</h2>
            <p className="fixes-subtitle">Basé sur OWASP Top 10</p>

            <ul className="fixes-list">
              <li>
                <strong>A03:2021-Injection</strong>
                <p>
                  Utiliser des requêtes paramétrées (Prepared Statements) pour
                  toutes les interactions avec la base de données.
                </p>
                <pre className="code-block">
                  <code>
                    {`$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");`}
                  </code>
                </pre>
              </li>
              <li>
                <strong>A02:2021-Cryptographic Failures</strong>
                <p>
                  Mettre à jour les algorithmes de hachage vers Argon2id ou bcrypt
                  avec un coût minimal de 12.
                </p>
              </li>
              <li>
                <strong>A05:2021-Security Misconf.</strong>
                <p>
                  Ajouter l’en-tête&nbsp;
                  <code>Strict-Transport-Security</code> avec{" "}
                  <code>max-age=63072000; includeSubDomains</code>.
                </p>
              </li>
            </ul>

            <button className="btn-secondary">
              Voir le guide complet de remédiation
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ScanResult;