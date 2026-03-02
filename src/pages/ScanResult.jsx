import React from "react";
import StatCard from "../components/StatCard";
import Tag from "../components/Tag";
import { jsPDF } from "jspdf";


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

const handleDownloadPdf = () => {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2;

  // ========== BANDEAU HEADER ==========
  doc.setFillColor(37, 99, 235); // bleu
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setTextColor(255);
  doc.setFontSize(18);
  doc.setFont(undefined, "bold");
  doc.text("ScanHathon - Rapport d'analyse de sécurité", marginX, 18);

  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text("Basé sur OWASP Top 10 et bonnes pratiques", marginX, 24);

  // On repasse en texte normal
  let y = 36;

  // ========== INFO GLOBALE ==========
  doc.setTextColor(0);
  doc.setFontSize(13);
  doc.setFont(undefined, "bold");
  doc.text("Résumé de l'analyse", marginX, y);
  y += 6;

  doc.setFontSize(11);
  doc.setFont(undefined, "normal");
  doc.setTextColor(60);

  const resumeLines = [
    "Score global : 72/100",
    "Vulnérabilités : 3 Critique - 5 Élevée - 4 Moyenne",
    "Périmètre : vérification des risques A03 (Injection), A04 (Cryptographic Failures), A05 (Security Misconfiguration).",
  ];

  resumeLines.forEach((line) => {
    const wrapped = doc.splitTextToSize(line, contentWidth);
    doc.text(wrapped, marginX, y);
    y += wrapped.length * 5;
  });

  y += 6;

  // LIGNE DE SÉPARATION
  doc.setDrawColor(220);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 8;

  // ========== SECTION VULNÉRABILITÉS ==========
  doc.setTextColor(0);
  doc.setFontSize(13);
  doc.setFont(undefined, "bold");
  doc.text("Vulnérabilités détectées", marginX, y);
  y += 8;

  doc.setFontSize(11);
  doc.setFont(undefined, "normal");

  const ensureSpace = (needed) => {
    if (y + needed > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }
  };

  vulns.forEach((v, index) => {
    ensureSpace(40);

    // "Carte" de vulnérabilité : fond léger
    const cardTop = y - 3;
    const cardHeight = 30; // on l'ajuste après
    doc.setFillColor(247, 248, 250);
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(marginX - 2, cardTop, contentWidth + 4, cardHeight, 2, 2, "S");

    y += 2;

    // Titre
    doc.setTextColor(0);
    doc.setFont(undefined, "bold");
    const title = `${index + 1}. [${v.code}] ${v.title}`;
    const titleLines = doc.splitTextToSize(title, contentWidth - 40);
    doc.text(titleLines, marginX + 2, y);
    const titleBlockHeight = titleLines.length * 5;
    y += titleBlockHeight + 2;

    // Badge sévérité (petit rectangle coloré)
    let badgeColor;
    switch (v.severity) {
      case "Critique":
        badgeColor = [247, 37, 37];
        break;
      case "Élevée":
        badgeColor = [242, 82, 2];
        break;
      case "Moyenne":
        badgeColor = [217, 168, 43];
        break;
      default:
        badgeColor = [123, 166, 237];
        break;
    }

    const badgeText = `Sévérité : ${v.severity}`;
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.setTextColor(255);
    const badgeWidth = doc.getTextWidth(badgeText) + 6;

    doc.setFillColor(...badgeColor);
    doc.roundedRect(marginX + 2, y - 4, badgeWidth, 7, 1.5, 1.5, "F");
    doc.text(badgeText, marginX + 5, y + 1);

    y += 8;

    // Description
    doc.setFontSize(11);
    doc.setFont(undefined, "normal");
    doc.setTextColor(80);
    const descLines = doc.splitTextToSize(v.description, contentWidth - 4);
    doc.text(descLines, marginX + 2, y);
    y += descLines.length * 5 + 6;

    // Petite marge après chaque carte
    y += 2;

    // on pourrait recalculer la vraie hauteur de la card et redessiner, mais pour un hackathon c'est suffisant visuellement
  });

  // Ligne de séparation avant les recos
  ensureSpace(30);
  doc.setDrawColor(220);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 8;

  // ========== SECTION RECOMMANDATIONS ==========
  doc.setFontSize(13);
  doc.setFont(undefined, "bold");
  doc.setTextColor(0);
  doc.text("Corrections suggérées (OWASP Top 10)", marginX, y);
  y += 8;

  doc.setFontSize(11);
  doc.setFont(undefined, "normal");
  doc.setTextColor(60);

  const reco = [
    "A03:2021 - Injection : Utiliser des requêtes paramétrées (Prepared Statements) pour toutes les interactions avec la base de données.",
    "A02:2021 - Cryptographic Failures : Migrer vers Argon2id ou bcrypt avec un coût adapté pour les mots de passe.",
    "A05:2021 - Security Misconfiguration : Ajouter l’en-tête Strict-Transport-Security avec max-age=63072000; includeSubDomains.",
  ];

  reco.forEach((line, idx) => {
    ensureSpace(20);

    // Sous-titre de la reco
    doc.setFont(undefined, "bold");
    doc.setTextColor(30);
    const label = line.split(" : ")[0]; // "A03:2021 - Injection"
    doc.text(`• ${label}`, marginX, y);
    y += 5;

    // Texte détaillé
    doc.setFont(undefined, "normal");
    doc.setTextColor(70);
    const text = line.substring(label.length + 3); // après " : "
    const wrapped = doc.splitTextToSize(text, contentWidth - 6);
    doc.text(wrapped, marginX + 4, y);
    y += wrapped.length * 5 + 4;
  });

  // ========== FOOTER ==========
  const dateStr = new Date().toLocaleDateString("fr-FR");
  const footerText = `ScanHathon • Rapport généré le ${dateStr}`;
  doc.setFontSize(9);
  doc.setTextColor(130);
  doc.text(
    footerText,
    marginX,
    pageHeight - 8
  );

  doc.save("rapport-securite.pdf");
};

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