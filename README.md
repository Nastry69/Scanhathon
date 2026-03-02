# 🔒 ScanHathon

ScanHathon est une application web développée dans le cadre d’un hackathon.
L’objectif est de proposer un outil d’analyse automatisée de sécurité du code source basé sur les standards OWASP Top 10.

L’application permet de :
- Importer un dépôt GitHub ou une archive ZIP
- Scanner le code source
- Identifier des vulnérabilités critiques
- Générer un rapport de sécurité
- Proposer des recommandations de remédiation

---

## 🎯 Objectif du Hackathon

Le but du projet est de développer un **scanner de gestion d’erreurs de sécurité** ciblant spécifiquement certaines catégories du **OWASP Top 10**.

Pour cette première version, nous avons concentré notre analyse sur :

- **A03 – Injection**
- **A04 – Cryptographic Failures**
- **A05 – Security Misconfiguration**

Ces trois catégories représentent des risques majeurs dans les applications web modernes.

---

## 🛡️ Périmètre d’analyse

### 🔎 A03 – Injection
Détection de :
- Requêtes SQL non paramétrées
- Absence de sanitisation des entrées utilisateur
- Exécution de commandes dynamiques non sécurisées

### 🔐 A04 – Cryptographic Failures
Analyse de :
- Utilisation d’algorithmes obsolètes (MD5, SHA1)
- Mauvaise gestion des cookies de session
- Absence de chiffrement HTTPS
- Clés exposées dans le code

### ⚙️ A05 – Security Misconfiguration
Vérification de :
- En-têtes de sécurité manquants (HSTS, CSP, X-Frame-Options)
- Configurations par défaut non sécurisées
- Fichiers sensibles exposés
- Variables d’environnement mal protégées

---

## 🧱 Architecture du Projet

### Frontend
- React
- React Router
- Gestion d’authentification (token localStorage)
- Composants UI réutilisables (StatCard, Tag, Layout)

### Backend (en cours d’intégration)
- Node.js
- Express
- API REST pour :
  - Création d’un scan
  - Suivi de progression
  - Récupération des résultats
  - Authentification utilisateur

---

## 📂 Structure du Projet
