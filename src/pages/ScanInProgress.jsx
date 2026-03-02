import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/** Page de l'analyse */
const ScanInProgress = () => {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Fausse progression + redirection vers le résultat
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) return 100;
        return p + 2;
      });
    }, 150);

    const timeout = setTimeout(() => {
      navigate("/analyses/resultat");
    }, 8000); // environ 8s

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [navigate]);

  // Calcul de l'angle du cercle en fonction du pourcentage
  const progressAngle = progress * 3.6;

  return (
    <div className="page-wrapper">
    
    {/* Titre + description du contexte */}
      <h1 className="page-title">Analyse de sécurité active</h1>
      <p className="page-subtitle">
        Nous examinons actuellement votre infrastructure pour identifier les
        vulnérabilités potentielles.
      </p>

    {/* Carte principale contenant l’indicateur de progression + détails des étapes */}
      <div className="card inprogress-card">

        {/* Colonne gauche : cercle de progression */}
        <div className="progress-circle-wrapper">
          <div className="progress-circle"
            style={{
              background: `conic-gradient(
                      var(--accent) ${progressAngle}deg,
                      #111827 ${progressAngle}deg
                      )`
            }}>
            <div className="progress-circle-inner">

              {/* Pourcentage d’avancement affiché au centre du cercle */}
              <span className="progress-value">{progress}%</span>
              <span className="progress-label">Analyse en cours</span>
            </div>
          </div>
        </div>

    {/* Colonne droite : liste des étapes de l’analyse */}
        <div className="progress-list">
    
    {/* Étape 1 : terminée */}
          <div className="progress-item done">
            <div className="progress-item-header">
              <span className="status-icon">✅</span>
              <span className="progress-item-title">
                Analyse du code source effectuée
              </span>
              <span className="progress-pill">OK</span>
            </div>
            <p className="progress-item-sub">
              0 vulnérabilité critique trouvée
            </p>
          </div>

    {/* Étape 2 : en cours */}
          <div className="progress-item active">
            <div className="progress-item-header">
              <span className="status-icon">⚡</span>
              <span className="progress-item-title">
                Scan des dépendances…
              </span>
              <span className="progress-pill">En cours</span>
            </div>
            <p className="progress-item-sub">
              Vérification de 142 bibliothèques externes
            </p>
          </div>

    {/* Étape 3 : en file d’attente */}
          <div className="progress-item queued">
            <div className="progress-item-header">
              <span className="status-icon">⏳</span>
              <span className="progress-item-title">
                Vérification OWASP Top 10
              </span>
              <span className="progress-pill">En file d’attente</span>
            </div>
            <p className="progress-item-sub">
              En attente des résultats précédents
            </p>
          </div>

    {/* Étape 4 : en file d’attente */}
          <div className="progress-item queued">
            <div className="progress-item-header">
              <span className="status-icon">⏳</span>
              <span className="progress-item-title">
                Analyse statique (SAST)
              </span>
              <span className="progress-pill">En file d’attente</span>
            </div>
            <p className="progress-item-sub">
              Recherche de patterns de sécurité
            </p>
          </div>
        </div>

    {/* Actions utilisateur (non connectées pour l’instant) */}
        <div className="inprogress-actions">
          <button className="btn-secondary">Mettre en pause</button>
          <button className="btn-danger">Annuler l’analyse</button>
        </div>
      </div>
    </div>
  );
};

export default ScanInProgress;