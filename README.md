# Verdaccio Populate Cache
Script which populates cache for verdaccio npm proxy by installing top 1000 popular packages
This script attempts to install last 3 versions of every npm package from file top-npm-packages.json

## How to run
* Run "npm config set registry {your private registry url}"
* Run "node index.js"

## Requirements
* node >= v16.16.0
* npm >= 6.14