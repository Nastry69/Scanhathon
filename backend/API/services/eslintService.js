const fs = require("fs");
const path = require("path");
const { ESLint } = require("eslint");

async function runEslint(projectPath, scanId) {

  // Utilise la config et les plugins du backend/API
  const backendConfigPath = path.join(__dirname, "../eslint.config.cjs");
  const backendRoot = path.join(__dirname, "..") // backend/API

  // Lancer ESLint sur le projet cloné, mais avec la config et les plugins du backend
  const eslint = new ESLint({
    cwd: backendRoot,
    overrideConfigFile: backendConfigPath
  });

  // Analyse les fichiers JS du projet cloné
  const results = await eslint.lintFiles([path.join(projectPath, "**/*.js")]);

  // Sauvegarde des résultats
  const scanFolder = path.join(__dirname, "../scans", scanId);
  fs.mkdirSync(scanFolder, { recursive: true });

  fs.writeFileSync(
    path.join(scanFolder, "eslint.json"),
    JSON.stringify(results, null, 2)
  );

  return results;
}

module.exports = { runEslint };