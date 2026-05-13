#!/usr/bin/env sh
set -e
# working_dir del servicio = ${APPSETTING_SERVICE_WWW_TARGET}/test (volumen del proyecto).
if [ -f package-lock.json ]; then
  npm ci || npm install
elif [ -f package.json ]; then
  npm install
fi
exec "$@"
