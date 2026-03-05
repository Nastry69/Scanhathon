import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAnalyses } from "../utils/api";

const ScanHistory = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getAnalyses()
      .then(setAnalyses)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleVoirDetails = (row) => {
    navigate("/analyses/resultat", { state: { analysisId: row.id, dbScore: row.score } });
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }),
      time: d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  return (
    <div className="page-wrapper">

    {/* En-tête de page : titre + sous-titre + actions */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Historique des analyses</h1>
          <p className="page-subtitle">
            Consultez et gérez vos scans de sécurité précédents sur l'ensemble
            de vos dépôts.
          </p>
        </div>

    {/* Actions globales de la page (export, nouveau scan) */}
        <div className="page-header-actions">
          <button className="btn-secondary">Exporter CSV</button>
          <Link to="/" className="btn-primary">+ Nouveau scan</Link>
        </div>
      </div>

    {/* Tableau principal listant les scans */}
      <div className="card history-table-card">
        {loading && <p style={{ padding: "1rem" }}>Chargement…</p>}
        {error && <p style={{ padding: "1rem", color: "red" }}>{error}</p>}
        {!loading && !error && (
          <table className="history-table">
            <thead>
              <tr>
                <th>Date &amp; heure</th>
                <th>Nom du dépôt</th>
                <th>Branche</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {analyses.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "1.5rem" }}>
                    Aucune analyse trouvée.
                  </td>
                </tr>
              )}
              {analyses.map((row) => {
                const { date, time } = formatDate(row.created_at);
                return (
                  <tr key={row.id}>
                    <td>
                      {date}
                      <br />
                      <span className="history-time">{time}</span>
                    </td>
                    <td>{row.repo_name ?? row.repo_url}</td>
                    <td>{row.branch ?? "—"}</td>
                    <td>
                      <button
                        className="btn-link"
                        onClick={() => handleVoirDetails(row)}
                      >
                        Voir détails →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
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
        <span>Conditions d'utilisation</span>
        <span>Support</span>
      </footer>
    </div>
  );
};

export default ScanHistory;
