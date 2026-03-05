import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import { getGithubRepos } from "../utils/api";

const NewScan = () => {
  const [githubUrl, setGithubUrl] = useState("");
  const [zipName, setZipName] = useState(null);
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const navigate = useNavigate();
  const { loggedIn, user } = useAuth();

  useEffect(() => {
    if (loggedIn && user?.github_username) {
      getGithubRepos().then(setRepos).catch(() => setRepos([]));
    }
  }, [loggedIn, user?.github_username]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!githubUrl) return;

    try {
      const response = await fetch("http://localhost:3001/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubUrl, userId: user?.id ?? null })
      });
      if (!response.ok) throw new Error("Erreur API");
      const { scanId, analysisId } = await response.json();
      navigate("/analyses/en-cours", { state: { scanId, analysisId } });
    } catch (err) {
      alert("Erreur lors de l’analyse !");
    }
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setZipName(file.name);
  };

  return (
    <div className="page-wrapper">
      <h1 className="newscan-page-title">Analysez la sécurité de votre code</h1>
      <p className="newscan-page-subtitle">
        Déposez vos fichiers ou liez votre repository pour obtenir un audit de
        sécurité complet et instantané.
        {!loggedIn && (<><br />Si vous souhaitez conserver votre analyse <a href="/authpage">connectez-vous.</a></>)}
      </p>

      <form className="card newscan-card" onSubmit={onSubmit}>
        <section className="newscan-section">
          <p className="newscan-section-label">Importer depuis GitHub</p>
          {loggedIn && user?.github_username && repos.length > 0 && (
            <div className="input-wrapper" style={{ marginBottom: "8px" }}>
              <span className="input-prefix-icon">🔗</span>
              <select
                className="input"
                value={selectedRepo}
                onChange={(e) => {
                  setSelectedRepo(e.target.value);
                  if (e.target.value) {
                    setGithubUrl(`https://github.com/${e.target.value}`);
                  } else {
                    setGithubUrl("");
                  }
                }}
              >
                <option value="">-- Sélectionner un repository --</option>
                {repos.map((repo) => (
                  <option key={repo.id} value={repo.full_name}>
                    {repo.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="input-wrapper">
            <span className="input-prefix-icon">🔗</span>
            <input
              type="url"
              className="input"
              placeholder="https://github.com/votre-utilisateur/votre-projet"
              value={githubUrl}
              onChange={(e) => {
                setGithubUrl(e.target.value);
                if (e.target.value) setSelectedRepo("");
              }}
            />
          </div>
        </section>

        <div className="divider">
          <span>ou</span>
        </div>

        <section className="newscan-section">
          <p className="newscan-section-label">Upload de fichiers</p>
          <label className="dropzone">
            <input
              type="file"
              accept=".zip"
              style={{ display: "none" }}
              onChange={onFileChange}
            />
            <div className="dropzone-icon-circle">
              <span className="dropzone-icon">📤</span>
            </div>
            <div className="dropzone-text-main">
              Glissez-déposez votre archive ZIP ici
            </div>
            <div className="dropzone-text-sub">
              ou cliquez pour parcourir vos fichiers (Max. 50MB)
            </div>
            {zipName && (
              <div className="dropzone-file">Fichier sélectionné : {zipName}</div>
            )}
          </label>
        </section>

        <button type="submit" className="btn-primary">
          <span>📊</span>
          Analyser le code source
        </button>

        <div className="newscan-footer">
          <div className="newscan-footer-item">
            <span className="newscan-footer-icon">🛡️</span>
            Analyse sécurisée
          </div>
          <div className="newscan-footer-item">
            <span className="newscan-footer-icon">⚡</span>
            Résultats en &lt; 2min
          </div>
          <div className="newscan-footer-item">
            <span className="newscan-footer-icon">📄</span>
            Rapport PDF détaillé
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewScan;
