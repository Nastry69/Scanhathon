'use strict';

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

function runSnyk(projectPath, scanId) {
  return new Promise((resolve, reject) => {
    const scanFolder = path.join(__dirname, '../scans', scanId);
    fs.mkdirSync(scanFolder, { recursive: true });

    const snykOutputPath = path.join(scanFolder, 'snyk.raw.json');

    const cmd = `snyk test --json --json-file-output="${snykOutputPath}"`;

    exec(
      cmd,
      {
        cwd: projectPath,
        env: {
          ...process.env,
          SNYK_TOKEN: process.env.SNYK_TOKEN,
          PATH: `${process.env.PATH}:/usr/local/bin:/opt/homebrew/bin`,
        },
        maxBuffer: 20 * 1024 * 1024,
      },
      (err, stdout, stderr) => {
        try {
          // Priorité: fichier JSON généré par Snyk
          if (fs.existsSync(snykOutputPath)) {
            const content = fs.readFileSync(snykOutputPath, 'utf8');
            const result = JSON.parse(content);

            fs.writeFileSync(
              path.join(scanFolder, 'snyk.json'),
              JSON.stringify(result, null, 2)
            );

            return resolve(result);
          }

          // Fallback (si le fichier n'a pas été produit)
          const text = String(stdout || '').trim();
          const result = text ? JSON.parse(text) : {};
          fs.writeFileSync(
            path.join(scanFolder, 'snyk.json'),
            JSON.stringify(result, null, 2)
          );
          return resolve(result);
        } catch (parseError) {
          return reject(
            new Error(
              `Snyk parse error: ${parseError.message}\nSTDERR: ${String(stderr || '').slice(0, 500)}`
            )
          );
        }
      }
    );
  });
}

module.exports = { runSnyk };