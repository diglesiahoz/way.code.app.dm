#!/bin/bash

# Examples:
# /opt/sh/common.sh compile themes/custom/memora/sass:themes/custom/memora/css [watch]

if [ "$(basename "$(test -L "$0" && readlink "$0" || echo "$0")")" != "common.sh" ]
then
  echo  "Usage: /opt/sh/common.sh compile [--watch|--dry-run|--log|--force]"
  exit 1
else
  if [ "$APPSETTING_ENV" = "local" ]
  then
    if [ "$2" = "watch" ]
    then
      SASS_CMD="/opt/dart-sass/sass --watch --style expanded --silence-deprecation import,mixed-decls $1"
    else 
      SASS_CMD="/opt/dart-sass/sass --style expanded --silence-deprecation import,mixed-decls $1"
    fi
  else
    SASS_CMD="/opt/dart-sass/sass --update --no-source-map --style compressed --silence-deprecation import,mixed-decls $1"
  fi
  log "Compiling styles: $SASS_CMD"
  cmd "cd $DRUPAL_ROOT && $SASS_CMD"
  checkError
fi