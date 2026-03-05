/**const path = require("path");
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
  const hasPackageJson = fs.existsSync(packageJsonPath);

  if (hasPackageJson) {
    // Vérifie package-lock
    const hasLock = fs.existsSync(
      path.join(repoPath, "package-lock.json")
    );

    // Installer directement à la racine pour les projets Node
    await new Promise((resolve, reject) => {
      const command = hasLock ? "npm ci" : "npm install";

      exec(command, { cwd: repoPath }, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  return {
    scanId,
    repoPath,
    projectPath: repoPath,
    hasPackageJson,
  };
}

module.exports = { prepareRepo };*/



const path = require("path");
const fs = require("fs");
const simpleGit = require("simple-git");
const { v4: uuidv4 } = require("uuid");
const { exec } = require("child_process");
const unzipper = require("unzipper");
const { Readable } = require("stream");

const SCANS_DIR = path.join(__dirname, "../scans");

async function prepareRepo(githubUrl) {
  const scanId = uuidv4();
  const repoPath = path.join(SCANS_DIR, scanId);

  fs.mkdirSync(repoPath, { recursive: true });

  await simpleGit().clone(githubUrl, repoPath);

  const packageJsonPath = path.join(repoPath, "package.json");
  if (fs.existsSync(packageJsonPath)) {
    await npmInstall(repoPath);
  }

  return {
    scanId,
    repoPath,
    projectPath: repoPath,
  };
}

async function prepareZipFromBuffer(zipBuffer, originalName = "upload.zip") {
  const scanId = uuidv4();
  const scanRoot = path.join(SCANS_DIR, scanId);

  const zipFileName =
    originalName && originalName.toLowerCase().endsWith(".zip")
      ? originalName
      : "upload.zip";

  const zipPath = path.join(scanRoot, zipFileName);
  const repoPath = path.join(scanRoot, "repo");

  fs.mkdirSync(repoPath, { recursive: true });

  // Save zip (utile debug)
  fs.writeFileSync(zipPath, zipBuffer);

  // Extract zip
  await Readable.from(zipBuffer)
    .pipe(unzipper.Extract({ path: repoPath }))
    .promise();

  // Find package.json (support github zip: repo/<name>-main/package.json)
  const projectPath = findProjectRootWithPackageJson(repoPath) || repoPath;

  if (fs.existsSync(path.join(projectPath, "package.json"))) {
    await npmInstall(projectPath);
  }

  return {
    scanId,
    repoPath,
    projectPath,
  };
}

function npmInstall(projectPath) {
  const hasLock = fs.existsSync(path.join(projectPath, "package-lock.json"));
  const command = hasLock ? "npm ci" : "npm install";

  return new Promise((resolve, reject) => {
    exec(command, { cwd: projectPath }, (err, _stdout, stderr) => {
      if (err) return reject(new Error(stderr || err.message));
      resolve();
    });
  });
}

function findProjectRootWithPackageJson(rootDir) {
  const hits = [];
  walk(rootDir, 0, 7, (dir) => {
    const pj = path.join(dir, "package.json");
    if (fs.existsSync(pj)) hits.push(dir);
  });

  if (hits.length === 0) return null;

  hits.sort((a, b) => a.split(path.sep).length - b.split(path.sep).length);
  return hits[0];
}

function walk(currentDir, depth, maxDepth, onDir) {
  if (depth > maxDepth) return;
  onDir(currentDir);

  let entries;
  try {
    entries = fs.readdirSync(currentDir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const e of entries) {
    if (!e.isDirectory()) continue;
    if (e.name === "node_modules" || e.name === ".git") continue;
    walk(path.join(currentDir, e.name), depth + 1, maxDepth, onDir);
  }
}

module.exports = { prepareRepo, prepareZipFromBuffer };