const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

function runSemgrep(projectPath, scanId) {
  return new Promise((resolve, reject) => {
    exec(
      `semgrep --config auto "${projectPath}" --json`,
      {
        cwd: projectPath,
        env: {
          ...process.env,
          PYTHONUTF8: "1",
          PYTHONIOENCODING: "utf-8",
          PATH: process.env.PATH + ':/usr/local/bin',
        },
        maxBuffer: 10 * 1024 * 1024,
      },
      (err, stdout, stderr) => {
        if (err && !stdout) {
          return reject(err);
        }

        // Sauvegarde automatique dans scans/<scanId>/
        try {
          const result = stdout ? JSON.parse(stdout) : {};

          const scanFolder = path.join(__dirname, "../scans", scanId);
          fs.mkdirSync(scanFolder, { recursive: true });

          fs.writeFileSync(
            path.join(scanFolder, "semgrep.json"),
            JSON.stringify(result, null, 2)
          );

          resolve(result);
        } catch (parseError) {
          reject(parseError);
        }
      }
    );
  });
}

module.exports = { runSemgrep };
