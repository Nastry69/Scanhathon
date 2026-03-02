const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

function runNpmAudit(projectPath, scanId) {
  return new Promise((resolve, reject) => {

    exec("npm audit --json", { cwd: projectPath }, (err, stdout, stderr) => {

      if (err && !stdout) {
        return reject(err);
      }

      try {
        const result = stdout ? JSON.parse(stdout) : {};

        // 🔥 Sauvegarde automatique dans scans/<scanId>/
        const scanFolder = path.join(__dirname, "../scans", scanId);

        fs.mkdirSync(scanFolder, { recursive: true });

        fs.writeFileSync(
          path.join(scanFolder, "npm-audit.json"),
          JSON.stringify(result, null, 2)
        );

        resolve(result);

      } catch (parseError) {
        reject(parseError);
      }
    });

  });
}

module.exports = { runNpmAudit };