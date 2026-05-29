#!/bin/sh
set -e
printenv

# Instalar dependencias solo si no existen node_modules
if [ ! -d "node_modules" ]; then
  npm install
fi

# Sincronizar documentación de proyectos personalizados.
npm run build:doc

if [ "$APPSETTING_DEV" = "true" ]
then
  npm run dev
else
  npm run build
fi