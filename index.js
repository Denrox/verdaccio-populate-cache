const { readFile  } = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');

const execP = promisify(exec);

const populatePackages = async () => {
  const arguments = process.argv.reduce((acc, arg) => {
    const [key, value] = arg.split('=');
    if (key && value && ['--count', '--versions', '--sleep', '--start'].includes(key)) {
      acc[key] = parseInt(value);
    }
    return acc;
  }, {});
  if (!arguments['--count'] || !arguments['--versions']) {
    throw 'Missing arguments';
  }
  const sleep = (arguments['--sleep'] || 0) * 1000;
  const start = arguments['--start'] || 0;
  readFile('./top-npm-packages.json', async (err, data) => {
    if (err) {
      throw 'Unable to read file';
    }
    if (data) {
      try {
        const packages = JSON.parse(data).slice(start, arguments['--count']);
        for (let i = 0; i < packages.length; i += 1) {
          try {
            const { stdout, stderr } = await execP(`npm view ${packages[i].name} versions`)
            if (stderr) {
              console.error(`Could not get versions for ${packages[i].name}`);
            } else {
              try {
                await new Promise(resolve => setTimeout(resolve, sleep));
                await execP(`npm install ${packages[i].name} --no-save --no-package-lock`);
                const versions = JSON.parse(stdout.replace(/\'/g, '"'));
                const lastVersions = versions.slice(arguments['--versions'] * -1);
                for (let k = 0; k < lastVersions.length; k += 1) {
                  await new Promise(resolve => setTimeout(resolve, sleep));
                  try {
                    const { stderr } = await execP(`npm install ${packages[i].name}@${lastVersions[k]} --no-save --no-package-lock`);
                    if (stderr) {
                      console.error(`Could not install ${packages[i].name}@${lastVersions[k]}`);
                    } else {
                      await execP(`npm remove ${packages[i].name}@${lastVersions[k]} --no-save --no-package-lock`);
                    }
                  } catch (e) {
                    console.error(`Could not install ${packages[i].name}@${lastVersions[k]}`);
                  }
                }
                console.log(`Processed ${i + 1}/${packages.length} - ${packages[i].name}`);
              } catch(e) {
                console.error(`Invalid versions response for ${packages[i].name}`);
              }
            }
          } catch (e) {
            console.error(`Could not get versions for ${packages[i].name}`);
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