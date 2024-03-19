# Verdaccio Populate Cache
Script which populates cache for verdaccio npm proxy by installing top popular packages.
This script attempts to install last versions of every npm package from file top-npm-packages.json

## How to run
* Run "npm config set registry {your private registry url}"
* Run "node index.js --count=100 --versions=10 --sleep=1"

## Parameters
* "--count={c}" - count of top packages to install
* "--versions={v}" - number of most recent versions to install for every package
* "--sleep={s}" - timeout in seconds after every 
* "--start={s}" - index of package to start from

## Packages which will not be cached
This script will cache only those versions of packages which are supported by node version installed on the machine from which you run it.

## Requirements
* node >= v16.16.0
* npm >= 6.14
