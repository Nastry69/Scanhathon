import React from "react";
import StatCard from "../components/StatCard";
import Tag from "../components/Tag";


/** Page Résultat du scan */
const ScanResult = () => {
  const vulns = [
    {
      id: "CVE-2023-4567",
      severity: "Critique",
      severityVariant: "critical",
      title: "Injection SQL non protégée sur l’API d’authentification",
      code: "CVE-2023-4567",
      description:
        "L’entrée utilisateur n’est pas correctement nettoyée avant l’exécution de la requête.",
    },
    {
      id: "OWASP-AB2",
      severity: "Élevée",
      severityVariant: "high",
      title: "Cryptographie défaillante sur les cookies de session",
      code: "OWASP-AB2",
      description:
        "Utilisation d’un algorithme de hachage obsolète (MD5) pour les identifiants de session.",
    },
    {
      id: "HTTP-HEADERS",
      severity: "Moyenne",
      severityVariant: "medium",
      title: "En-têtes de sécurité HSTS manquants",
      code: "HTTP-HEADERS",
      description:
        "La directive Strict-Transport-Security n’est pas activée sur le domaine principal.",
    },
  ];


  return (
    <div className="page-wrapper">
    {/* En-tête de page : titre + description + action principale */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Résultats de l’analyse</h1>
          <p className="page-subtitle">
            Visualisez les vulnérabilités détectées sur ce dépôt.
          </p>
        </div>
    {/* CTA principal : export du rapport sous forme de PDF */}
        <button className="btn-primary">Télécharger le rapport PDF</button>
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
          <button className="btn-link">Voir le détail de conformité →</button>
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
  );
};

export default ScanResult;