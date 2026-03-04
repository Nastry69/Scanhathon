const path = require("path");
const fs = require("fs");
const simpleGit = require("simple-git");
const { v4: uuidv4 } = require("uuid");
const { exec } = require("child_process");

async function prepareRepo(githubUrl) {
  const scanId = uuidv4();
  const repoPath = path.join(__dirname, "../scans", scanId);

  fs.mkdirSync(repoPath, { recursive: true });

  // Clone repo
  await simpleGit().clone(githubUrl, repoPath);

  // On suppose que package.json est à la racine
  const packageJsonPath = path.join(repoPath, "package.json");

  if (!fs.existsSync(packageJsonPath)) {
    throw new Error("No package.json found at repository root");
  }

  // Vérifie package-lock
  const hasLock = fs.existsSync(
    path.join(repoPath, "package-lock.json")
  );

  // Installer directement à la racine
  await new Promise((resolve, reject) => {
    const command = hasLock ? "npm ci" : "npm install";

    exec(command, { cwd: repoPath }, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  return {
    scanId,
    repoPath,
    projectPath: repoPath
  };
}

module.exports = { prepareRepo };