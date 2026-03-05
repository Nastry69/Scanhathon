import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/** Page de l'analyse */
const ScanInProgress = () => {
  const [progress, setProgress] = useState(0);
  const [scanReady, setScanReady] = useState(false);
  const [scanError, setScanError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [scanId, setScanId] = useState(location.state?.scanId ?? null);
  const [analysisId, setAnalysisId] = useState(location.state?.analysisId ?? null);
  const githubUrl = location.state?.githubUrl;
  const userId = location.state?.userId ?? null;

  // Lance le scan dès l'arrivée sur la page si aucun scanId n'a encore été fourni.
  useEffect(() => {
    if (scanId) return;

    if (!githubUrl) {
      setScanError("Aucun repository fourni pour lancer le scan.");
      return;
    }

    let cancelled = false;

    const startScan = async () => {
      try {
        const response = await fetch("http://localhost:3001/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ githubUrl, userId })
        });

        if (!response.ok) throw new Error("Erreur API");

        const data = await response.json();
        if (cancelled) return;

        setScanId(data.scanId ?? null);
        setAnalysisId(data.analysisId ?? null);
        setProgress((p) => Math.max(p, 12));
      } catch (err) {
        if (cancelled) return;
        setScanError("Impossible de lancer l'analyse.");
      }
    };

    startScan();

    return () => {
      cancelled = true;
    };
  }, [scanId, githubUrl, userId]);

  useEffect(() => {
    // Fausse progression
    const interval = setInterval(() => {
      setProgress((p) => {
        if (scanReady) return 100;
        if (p >= 95) return 95;
        return p + 2;
      });
    }, 150);

    // Polling pour vérifier la création des fichiers JSON
    const pollInterval = setInterval(async () => {
      if (!scanId) return;
      try {
        const res1 = await fetch(`http://localhost:3001/scans/${scanId}/eslint.json`);
        const res2 = await fetch(`http://localhost:3001/scans/${scanId}/npm-audit.json`);
        if (res1.ok && res2.ok) {
          setScanReady(true);
        }
      } catch (err) {
        // ignore
      }
    }, 2000);

    return () => {
      clearInterval(interval);
      clearInterval(pollInterval);
    };
  }, [scanId, scanReady]);

  useEffect(() => {
    if (scanReady && scanId) {
      navigate("/analyses/resultat", { state: { scanId, analysisId } });
    }
  }, [scanReady, scanId, analysisId, navigate]);

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
      {scanError && <p className="page-subtitle" style={{ color: "#ef4444" }}>{scanError}</p>}

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