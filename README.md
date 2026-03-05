# Scanhathon

Application web d'analyse de sécurité de code source. Elle accepte un **dépôt Git** (URL) ou une **archive ZIP**, combine plusieurs outils de scan (npm audit, Semgrep, Snyk, ESLint) pour détecter les vulnérabilités et problèmes de qualité de code, puis génère des rapports détaillés exportables en PDF.

L'analyse couvre trois catégories du **Top 10 OWASP** :

| Catégorie | Description |
|-----------|-------------|
| **A03 - Injection** | Détection de failles d'injection (SQL, commandes, XSS…) via analyse statique Semgrep |
| **A04 - Insecure Design** | Identification de mauvaises pratiques de conception et patterns non sécurisés |
| **A05 - Security Misconfiguration** | Détection de dépendances vulnérables et configurations exposées (npm audit, Snyk) |

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 19, React Router 7, Vite 7 |
| Backend (API principale) | Node.js, Express 5 |
| Backend (API scanner) | Node.js, Express 5 |
| Base de données / Auth | Supabase (PostgreSQL + Auth) |
| Authentification | GitHub OAuth 2.0, JWT |
| Outils de scan | npm audit, Semgrep, Snyk, ESLint |
| PDF | @react-pdf/renderer, jsPDF |

## Prérequis

- Node.js >= 18
- npm
- [Semgrep](https://semgrep.dev/docs/getting-started/) installé localement (`pip install semgrep`)
- Un compte [Supabase](https://supabase.com) avec un projet créé
- Une [OAuth App GitHub](https://github.com/settings/developers) enregistrée
- (Optionnel) Un token [Snyk](https://app.snyk.io/account)

## Installation

### 1. Cloner le dépôt

```bash
git clone <url-du-repo>
cd Scanhathon
```

### 2. Variables d'environnement

Copier le fichier d'exemple et le remplir :

```bash
cp .env.example .env
```

Éditer `.env` :

```env
# Supabase
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<votre-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<votre-service-role-key>

# GitHub OAuth
GITHUB_CLIENT_ID=<client-id-oauth-app>
GITHUB_CLIENT_SECRET=<client-secret-oauth-app>

# Clé de chiffrement AES-256 pour les tokens GitHub (64 caractères hex)
# Générer avec : node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
GITHUB_TOKEN_SECRET=<clé-64-chars>

# URLs
FRONTEND_URL=http://localhost:5173
CALLBACK_URL=http://localhost:3001/auth/github/callback

# Snyk (optionnel)
SNYK_TOKEN=<votre-token-snyk>
```

> **GitHub OAuth App** : dans les paramètres de l'app GitHub, renseigner `http://localhost:3001/auth/github/callback` comme URL de callback.

### 3. Installer les dépendances

```bash
# Dépendances frontend + backend principal
npm install

# Dépendances de l'API scanner
cd backend/API && npm install && cd ../..
```

## Lancement

L'application nécessite **2 terminaux** :

```bash
# Terminal 1 — Frontend (http://localhost:5173)
npm run dev

# Terminal 2 — API principale (port 3000) + API scanner (port 3001)
npm run server
```

La documentation Swagger est disponible sur [http://localhost:3000/api-docs](http://localhost:3000/api-docs).

## Structure du projet

```
Scanhathon/
├── src/                    # Frontend React
│   ├── components/         # Composants réutilisables
│   ├── pages/              # Pages de l'application
│   └── utils/              # Contexte auth, clients API
├── backend/
│   ├── server.js           # API principale (port 3000)
│   ├── routes/             # Routes Express (users, analyses, github…)
│   ├── middleware/         # Middleware JWT
│   └── API/                # API scanner (port 3001)
│       ├── app.js          # Point d'entrée
│       ├── controllers/    # Logique de scan
│       └── services/       # npm audit, Semgrep, Snyk, ESLint
├── .env.example
└── package.json
```

## Build de production

```bash
npm run build
# Fichiers statiques générés dans dist/
```
