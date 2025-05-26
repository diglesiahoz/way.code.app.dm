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
npx --yes create-next-app -e https://github.com/chapter-three/next-drupal-basic-starter tmp
cp -r $(pwd)/tmp/* $(pwd) && rm -r $(pwd)/tmp
npm install
echo ======================== Run app
npm run dev