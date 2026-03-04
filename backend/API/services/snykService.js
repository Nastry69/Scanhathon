const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');


function runSnyk(projectPath, scanId) {
  return new Promise((resolve, reject) => {
    exec(`snyk test --json`, {
      cwd: projectPath,
      env: {
        ...process.env,
        SNYK_TOKEN: process.env.SNYK_TOKEN,
        },
        maxBuffer: 10 * 1024 * 1024,
    }, (err, stdout, stderr) => {
      if (err && !stdout) {
        return reject(err);
      }

      // Sauvegarde automatique dans scans/<scanId>/
      try {
                const result = stdout ? JSON.parse(stdout) : {};
      
                const scanFolder = path.join(__dirname, "../scans", scanId);
                fs.mkdirSync(scanFolder, { recursive: true });
      
                fs.writeFileSync(
                  path.join(scanFolder, "snyk.json"),
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

module.exports = { runSnyk };