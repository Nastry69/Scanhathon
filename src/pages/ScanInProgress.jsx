import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/** Page de l'analyse */
const ScanInProgress = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [scanReady, setScanReady] = useState(!!location.state?.scanId);
  const [scanError, setScanError] = useState("");
  const [statusMessage, setStatusMessage] = useState("Initialisation du scan...");
  const [serverProgress, setServerProgress] = useState(0);
  const [scanStage, setScanStage] = useState("starting");
  const startTriggeredRef = useRef(false);
  const [scanId, setScanId] = useState(location.state?.scanId ?? null);
  const [analysisId, setAnalysisId] = useState(location.state?.analysisId ?? null);
  const githubUrl = location.state?.githubUrl;
  const userId = location.state?.userId ?? null;

  const stageRank = {
    starting: 0,
    preparing_repo: 1,
    npm_audit: 2,
    eslint: 3,
    semgrep: 4,
    snyk: 5,
    db_save: 6,
    cleanup: 7,
    completed: 8,
  };

  const progressSteps = [
    {
      key: "preparing_repo",
      rank: 1,
      title: "Préparation du repository",
      sub: "Clonage du dépôt et préparation de l'environnement",
    },
    {
      key: "npm_audit",
      rank: 2,
      title: "Scan des dépendances",
      sub: "Analyse npm audit des packages du projet",
    },
    {
      key: "eslint",
      rank: 3,
      title: "Analyse ESLint",
      sub: "Détection de patterns à risque dans le code",
    },
    {
      key: "semgrep",
      rank: 4,
      title: "Analyse SAST Semgrep",
      sub: "Contrôles de sécurité approfondis (peut prendre plus de temps)",
    },
    {
      key: "snyk",
      rank: 5,
      title: "Analyse Snyk",
      sub: "Contrôle des vulnérabilités applicatives et supply chain",
    },
  ];

  // Lance le scan dès l'arrivée sur la page si aucun scanId n'a encore été fourni.
  useEffect(() => {
    if (startTriggeredRef.current) return;

    if (scanId) return;

    if (!githubUrl) {
      setScanError("Aucun repository fourni pour lancer le scan.");
      return;
    }

    startTriggeredRef.current = true;
    setStatusMessage("Lancement du scan...");

    const pollStatus = setInterval(async () => {
      try {
        const params = new URLSearchParams({ githubUrl, userId: String(userId ?? "") });
        const res = await fetch(`http://localhost:3001/scan/status?${params.toString()}`);
        if (!res.ok) return;
        const status = await res.json();
        if (typeof status.progress === "number") {
          setServerProgress(Math.min(100, status.progress));
        }
        if (status.stage) setScanStage(status.stage);
        if (status.message) setStatusMessage(status.message);
      } catch (_err) {
        // Ignore les erreurs de polling et continue.
      }
    }, 700);

    const startScan = async () => {
      try {
        const response = await fetch("http://localhost:3001/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ githubUrl, userId })
        });

        if (!response.ok) throw new Error("Erreur API");

        const data = await response.json();

        setScanId(data.scanId ?? null);
        setAnalysisId(data.analysisId ?? null);
        setServerProgress(100);
        setScanStage("completed");
        setStatusMessage("Scan terminé, préparation des résultats...");
        setScanReady(true);
      } catch (err) {
        setScanError("Impossible de lancer l'analyse.");
      } finally {
        clearInterval(pollStatus);
      }
    };

    startScan();

    return () => {
      clearInterval(pollStatus);
    };
  }, [scanId, githubUrl, userId]);

  useEffect(() => {
    const stageFloor = {
      starting: 4,
      preparing_repo: 15,
      npm_audit: 30,
      eslint: 45,
      semgrep: 60,
      snyk: 75,
      db_save: 88,
      cleanup: 96,
      completed: 100,
    };

    const interval = setInterval(() => {
      setProgress((prev) => {
        const floor = stageFloor[scanStage] ?? 0;
        let target = Math.max(serverProgress, floor);

        // Semgrep est souvent l'étape la plus longue: progression visuellement plus réaliste.
        if (!scanReady && scanStage === "semgrep") {
          target = Math.max(target, Math.min(82, prev + 0.45));
        }

        const cap = scanReady ? 100 : 97;
        const boundedTarget = Math.min(cap, target);
        const step = Math.max(0.35, (boundedTarget - prev) * 0.2);
        const next = prev + step;

        return Math.min(cap, Math.max(prev, Math.round(next * 10) / 10));
      });
    }, 180);

    return () => clearInterval(interval);
  }, [scanReady, scanStage, serverProgress]);

  useEffect(() => {
    if (scanReady && scanId) {
      const repoName = githubUrl
        ? githubUrl.replace(/\/+$/, "").split("/").pop().replace(".git", "")
        : "Repo inconnu";
      navigate("/analyses/resultat", { state: { scanId, analysisId, repoName, githubUrl } });
    }
  }, [scanReady, scanId, analysisId, githubUrl, navigate]);

  const roundedProgress = Math.round(progress);
  const progressAngle = roundedProgress * 3.6;
  const currentRank = scanStage === "starting" ? 1 : (stageRank[scanStage] ?? 0);
  const currentStepLabel = scanStage === "completed" ? "Scan terminé" : (statusMessage || "Analyse en cours");

  const getStepUi = (stepRank) => {
    if (scanStage === "completed") {
      return { className: "done", icon: "✅", pill: "OK" };
    }
    if (currentRank > stepRank) {
      return { className: "done", icon: "✅", pill: "OK" };
    }
    if (currentRank === stepRank) {
      return { className: "active", icon: "⚡", pill: "En cours" };
    }
    return { className: "queued", icon: "⏳", pill: "En attente" };
  };

  return (
    <div className="page-wrapper">
      {/* Titre + description du contexte */}
      <h1 className="page-title">Analyse de sécurité active</h1>
      <p className="page-subtitle">
        Nous examinons actuellement votre infrastructure pour identifier les
        vulnérabilités potentielles.
      </p>
      <p className="page-subtitle">{statusMessage}</p>
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
              <span className="progress-value">{roundedProgress}%</span>
              <span className="progress-label">{currentStepLabel}</span>
            </div>
          </div>
        </div>

        {/* Colonne droite : liste des étapes de l’analyse */}
        <div className="progress-list">
          {progressSteps.map((step) => {
            const ui = getStepUi(step.rank);
            return (
              <div key={step.key} className={`progress-item ${ui.className}`}>
                <div className="progress-item-header">
                  <span className="status-icon">{ui.icon}</span>
                  <span className="progress-item-title">{step.title}</span>
                  <span className="progress-pill">{ui.pill}</span>
                </div>
                <p className="progress-item-sub">{step.sub}</p>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default ScanInProgress;