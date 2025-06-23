#!/bin/bash

# Examples:
# ./common.sh compile
# ./common.sh compile --watch

if [ "$(basename "$(test -L "$0" && readlink "$0" || echo "$0")")" != "common.sh" ]
then
  echo  "Usage: $(dirname $(test -L "$0" && readlink "$0" || echo "$0"))/common.sh compile [--watch|--dry-run|--log|--force]"
  exit 1
else
  if [ -z $APPSETTING_COMPILE_MAPPING ]
  then
    error "You must set the \"APPSETTING_COMPILE_MAPPING\" variable in the environment configuration file (.env)"
  fi
  if [ "$APPSETTING_ENV" = "local" ]
  then
    if [ "$2" = "watch" ]
    then
      SASS_CMD="/opt/dart-sass/sass --watch --style expanded --silence-deprecation import,mixed-decls $APPSETTING_COMPILE_MAPPING"
    else 
      SASS_CMD="/opt/dart-sass/sass --style expanded --silence-deprecation import,mixed-decls $APPSETTING_COMPILE_MAPPING"
    fi
  else
    SASS_CMD="/opt/dart-sass/sass --update --no-source-map --style compressed --silence-deprecation import,mixed-decls $APPSETTING_COMPILE_MAPPING"
  fi
  log "Compiling styles: $SASS_CMD"
  cmd "cd $DRUPAL_ROOT && $SASS_CMD"
  checkError
fi