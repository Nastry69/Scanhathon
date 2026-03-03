import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";


/** Page New Scan */
const NewScan = () => {
  const [githubUrl, setGithubUrl] = useState("");
  const [zipName, setZipName] = useState(null);
  const navigate = useNavigate();
  const { loggedIn } = useAuth();

  const onSubmit = (e) => {
    e.preventDefault();
    // ici tu pourrais appeler /api/scans, mais on reste full front
    navigate("/analyses/en-cours");
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setZipName(file.name);
  };

  return (
    <div className="page-wrapper">
      {/* Titre principal + description de la fonctionnalité */}
      <h1 className="newscan-page-title">Analysez la sécurité de votre code</h1>
      <p className="newscan-page-subtitle">
        Déposez vos fichiers ou liez votre repository pour obtenir un audit de
        sécurité complet et instantané.
        {!loggedIn && (<><br />Si vous souhaitez conserver votre analyse <a href="/authpage">connectez-vous.</a></>)}
      </p>

      {/* Formulaire principal de configuration du scan */}
      <form className="card newscan-card" onSubmit={onSubmit}>
        <section className="newscan-section">
          <p className="newscan-section-label">Importer depuis GitHub</p>
          <div className="input-wrapper">
            <span className="input-prefix-icon">🔗</span>
            <input
              type="url"
              className="input"
              placeholder="https://github.com/votre-utilisateur/votre-projet"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
            />
          </div>
        </section>

        {/* Séparateur visuel entre les deux modes d'import */}
        <div className="divider">
          <span>ou</span>
        </div>

        {/* Section : upload de fichiers ZIP */}
        <section className="newscan-section">
          <p className="newscan-section-label">Upload de fichiers</p>

          {/* Label dropzone. */}
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

            {/* Affichage du nom du fichier sélectionné (UX) */}
            {zipName && (
              <div className="dropzone-file">Fichier sélectionné : {zipName}</div>
            )}
          </label>
        </section>

        {/* CTA principal pour lancer l'analyse */}
        <button type="submit" className="btn-primary">
          <span>📊</span>
          Analyser le code source
        </button>

        {/* Arguments de l'analyse */}
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
