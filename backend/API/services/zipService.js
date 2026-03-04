const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const unzipper = require("unzipper");

async function extractZip(zipPath, destDir) {
  await fsp.mkdir(destDir, { recursive: true });

  await fs
    .createReadStream(zipPath)
    .pipe(unzipper.Parse())
    .on("entry", (entry) => {
      const entryPath = entry.path;

      const resolved = path.resolve(destDir, entryPath);
      const base = path.resolve(destDir);
      if (!resolved.startsWith(base)) {
        entry.autodrain();
        return;
      }

      if (entry.type === "Directory") {
        fs.mkdirSync(resolved, { recursive: true });
        entry.autodrain();
      } else {
        fs.mkdirSync(path.dirname(resolved), { recursive: true });
        entry.pipe(fs.createWriteStream(resolved));
      }
    })
    .promise();
}

async function findRepoRoot(extractedDir) {
  const entries = await fsp.readdir(extractedDir, { withFileTypes: true });
  const dirs = entries.filter((e) => e.isDirectory());
  const files = entries.filter((e) => e.isFile());

  if (dirs.length === 1 && files.length === 0) {
    return path.join(extractedDir, dirs[0].name);
  }
  return extractedDir;
}

module.exports = { extractZip, findRepoRoot };