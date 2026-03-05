const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

function runNpmAudit(projectPath, scanId) {
  return new Promise((resolve, reject) => {
    const packageJsonPath = path.join(projectPath, "package.json");
    const scanFolder = path.join(__dirname, "../scans", scanId);
    fs.mkdirSync(scanFolder, { recursive: true });

    if (!fs.existsSync(packageJsonPath)) {
      const result = {
        skipped: true,
        reason: "no_package_json",
        auditReportVersion: 2,
        vulnerabilities: {},
        metadata: {
          vulnerabilities: { info: 0, low: 0, moderate: 0, high: 0, critical: 0, total: 0 }
        }
      };

      fs.writeFileSync(
        path.join(scanFolder, "npm-audit.json"),
        JSON.stringify(result, null, 2)
      );

      return resolve(result);
    }

    exec("npm audit --json", { cwd: projectPath }, (err, stdout) => {

      if (err && !stdout) {
        return reject(err);
      }

      try {
        const result = stdout ? JSON.parse(stdout) : {};

        // Sauvegarde automatique dans scans/<scanId>/

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