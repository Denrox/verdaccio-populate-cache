const { readFile  } = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');

const execP = promisify(exec);

const populatePackages = async () => {
  readFile('./top-npm-packages.json', async (err, data) => {
    if (err) {
      throw 'Unable to read file';
    }
    if (data) {
      try {
        const packages = JSON.parse(data).slice(0, 1000);
        for (let i = 0; i < packages.length; i += 1) {
          const { stdout, stderr } = await execP(`npm view ${packages[i].name} versions`)
          if (stderr) {
            console.error(`Could not get versions for ${packages[i].name}`);
          } else {
            try {
              const versions = JSON.parse(stdout.replace(/\'/g, '"'));
              const lastVersions = versions.slice(-3);
              for (let k = 0; k < lastVersions.length; k += 1) {
                const { stderr } = await execP(`npm install ${packages[i].name}@${lastVersions[k]} --no-save --no-package-lock`);
                if (stderr) {
                  console.error(`Could not install ${packages[i].name}@${lastVersions[k]}`);
                } else {
                  await execP(`npm remove ${packages[i].name}@${lastVersions[k]} --no-save --no-package-lock`);
                }
              }
              console.log(`Processed ${i + 1}/${packages.length}`);
            } catch(e) {
              console.error(`Invalid versions response for ${packages[i].name}`);
            }
          }
          if (i > 5) {
            break;
          }
        }
      } catch (e) {
        throw 'Invalid json';
      }
    }
  });
}

(async () => {
  await populatePackages();
})();