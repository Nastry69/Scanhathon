import React from "react";
import { Link } from "react-router-dom";

/** Scan History */
const data = [
  {
    date: "24 Oct. 2023",
    time: "14:32",
    repo: "frontend-main-app",
    score: 85,
    status: "Terminé",
  },
  {
    date: "22 Oct. 2023",
    time: "09:15",
    repo: "auth-service-v2",
    score: 92,
    status: "Terminé",
  },
  {
    date: "20 Oct. 2023",
    time: "17:45",
    repo: "api-gateway-edge",
    score: 64,
    status: "Action requise",
  },
  {
    date: "15 Oct. 2023",
    time: "11:20",
    repo: "legacy-db-connector",
    score: 45,
    status: "Critique",
  },
];

const scoreClass = (score) => {
  if (score >= 80) return "badge-score-high";
  if (score >= 60) return "badge-score-medium";
  return "badge-score-low";
};

const statusClass = (status) => {
  if (status === "Terminé") return "badge-status-ok";
  if (status === "Action requise") return "badge-status-warning";
  return "badge-status-critical";
};

const ScanHistory = () => {
  return (
    <div className="page-wrapper">

    {/* En-tête de page : titre + sous-titre + actions */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Historique des analyses</h1>
          <p className="page-subtitle">
            Consultez et gérez vos scans de sécurité précédents sur l’ensemble
            de vos dépôts.
          </p>
        </div>

    {/* Actions globales de la page (export, nouveau scan) */}
        <div className="page-header-actions">
          <button className="btn-secondary">Exporter CSV</button>
          <Link to="/analyses/nouveau" className="btn-primary">+ Nouveau scan</Link>
        </div>
      </div>

    {/* Bloc de synthèse */}
      <div className="card history-summary">
        <div className="history-stat">
          <div className="history-label">Scans totaux</div>
          <div className="history-value">1 284</div>
          <div className="history-sub">+12% vs mois dernier</div>
        </div>
        <div className="history-stat">
          <div className="history-label">Score moyen</div>
          <div className="history-value">78/100</div>
          <div className="history-sub">-2% vs mois dernier</div>
        </div>
        <div className="history-stat">
          <div className="history-label">Vulnérabilités critiques</div>
          <div className="history-value">14</div>
          <div className="history-sub">8 résolues</div>
        </div>
      </div>

    {/* Tableau principal listant les scans */}
      <div className="card history-table-card">
        <table className="history-table">
          <thead>
            <tr>
              <th>Date &amp; heure</th>
              <th>Nom du dépôt</th>
              <th>Score de sécurité</th>
              <th>Statut</th>
              <th>Action</th>
            </tr>
          </thead>


    {/* Parcours des données mockées. À remplacé par une donnée venant du backend.*/}
          <tbody>
            {data.map((row) => (
              <tr key={row.repo}> {/* à remplacer idéalement un id unique)*/}
                <td>
                  {row.date}
                  <br />
                  <span className="history-time">{row.time}</span>
                </td>
                <td>{row.repo}</td>
                <td>

    {/* Badge de score avec style dynamique */}
                  <span className={`badge ${scoreClass(row.score)}`}>
                    {row.score}/100
                  </span>
                </td>
                <td>
                  <span className={`badge ${statusClass(row.status)}`}>
                    {row.status}
                  </span>
                </td>
                <td>

    {/* Action future : navigation vers la page détail du scan */}
                  <button className="btn-link">Voir détails →</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

    {/* Pagination mockée (statique pour l'instant) */}
        <div className="history-pagination">
          <button className="btn-chip">&lt;</button>
          <button className="btn-chip btn-chip-active">1</button>
          <button className="btn-chip">2</button>
          <button className="btn-chip">3</button>
          <button className="btn-chip">&gt;</button>
        </div>
      </div>

    {/* Bandeau promotionnel pour la fonctionnalité CI/CD */}
      <div className="card banner-ci">
        <div>
          <h2>Automatisez vos analyses de sécurité</h2>
          <p>
            Configurez des analyses automatiques lors de chaque commit ou pull
            request pour sécuriser votre code en continu.
          </p>
        </div>
        <button className="btn-primary">Configurer le CI/CD</button>
      </div>

    {/* Footer simple de la page */}
      <footer className="page-footer small">
        <span>© 2023 SecureScan Security. Tous droits réservés.</span>
        <span>Politique de confidentialité</span>
        <span>Conditions d’utilisation</span>
        <span>Support</span>
      </footer>
    </div>
  );
};

export default ScanHistory;