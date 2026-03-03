import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { scanRepo } from "../utils/scanApi";

/** Page New Scan */
const NewScan = () => {
  const [githubUrl, setGithubUrl] = useState("");
  const [zipName, setZipName] = useState(null);
  const navigate = useNavigate();

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
      <h1 className="page-title">Analysez la sécurité de votre code</h1>
      <p className="page-subtitle">
        Déposez vos fichiers ou liez votre repository pour obtenir un audit de
        sécurité complet et instantané.
        <br />Si vous souhaitez conservez votre analyse <a href="/login">connectez-vous.</a>
      </p>

    {/* Formulaire principal de configuration du scan */}
      <form className="card newscan-card" onSubmit={onSubmit}>
        <section className="newscan-section">
          <h2 className="section-title">Importer depuis GitHub</h2>
          <div className="input-wrapper">
            <span className="input-prefix">https://</span>
            <input
              type="url"
              className="input"
              placeholder="github.com/votre-utilisateur/votre-projet"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
            />
          </div>
        </section>

    {/* Séparateur visuel entre les deux modes d’import */}
        <div className="divider">
          <span>ou</span>
        </div>
    
    {/* Section : upload de fichiers ZIP */}
        <section className="newscan-section">
          <h2 className="section-title">Upload de fichiers</h2>

    {/* Label dropzone. */}
          <label className="dropzone">
            <input
              type="file"
              accept=".zip"
              style={{ display: "none" }}
              onChange={onFileChange}
            />
            <div className="dropzone-icon">📁</div>
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

    {/* CTA principal pour lancer l’analyse */}
        <button type="submit" className="btn-primary">
          Analyser le code source
        </button>

    {/* Arguments de l'analyse */}
        <div className="newscan-footer">
          <span>Analyse sécurisée</span>
          <span>Rapport PDF détaillé</span>
        </div>
      </form>

    {/* Footer léger en bas de page */}
      <footer className="page-footer">
        <span>Enterprise Ready</span>
        <span>Encryption AES-256</span>
      </footer>
    </div>
  );
};

export default NewScan;