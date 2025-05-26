#!/usr/bin/env sh
set -e
echo ======================== Info
echo "Running from user: $(whoami)"
echo "Running from path: $(pwd)"
echo "NPM version: $(npm -v)"
echo "NPX version: $(npx -v)"
echo ======================== Print environment
printenv | sort
echo ======================== Install packages
if [ ! -f $(pwd)/.env ]
then
  npx --yes create-next-app -e https://github.com/chapter-three/next-drupal-basic-starter next-drupal-basic-starter
  cp -r $(pwd)/next-drupal-basic-starter/* $(pwd) && rm -r $(pwd)/next-drupal-basic-starter
fi
npm install
echo ======================== Run app
npm run dev