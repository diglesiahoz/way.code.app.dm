#!/bin/bash

function log() {
  echo -e "\033[0;34m\xe2\x9e\xa4\033[0m $*"
}
function error() {
  echo -e "\033[0;31m\xe2\x9c\x96\033[0m $*" && exit 1
}
function success() {
  [ "$*" = "" ] && MESSAGE="OK!" || MESSAGE="$*"
  echo -e "\033[0;32m\xe2\x9c\x94\033[0m $MESSAGE"
}
function checkError() {
  EXIT_CODE=$?
  if [ "$OPT_DRYRUN" = false ]
  then
    if [ $EXIT_CODE != 0 ]
    then
      [ "$*" = "" ] && MESSAGE="Error" || MESSAGE="$*"
      error $MESSAGE
    else
      success "OK"
    fi
  fi
}
function cmd() {
  CMD=$*
  [ "$OPT_VERBOSE" = false ] && CMD="$CMD >> $CURRENT_SCRIPT_PATH/$CURRENT_SCRIPT_NAME.log 2>&1"
  [ "$OPT_VERBOSE" = true ] && [ "$OPT_DRYRUN" = false ] && echo -e "\033[0;35m\xe2\x9c\xb7\033[0m $CMD"
  if [ "$OPT_DRYRUN" = false ]
  then
    eval $CMD
  else 
    echo -e "\033[0;34m[DRY-RUN]\033[0m $CMD"
  fi
}

# Set variables
CURRENT_SCRIPT_PATH="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
CURRENT_SCRIPT_NAME="$(basename "$(test -L "$0" && readlink "$0" || echo "$0")")"
DRUPAL_ROOT=$APPSETTING_SERVICE_WWW_TARGET
[ ! -d $DRUPAL_ROOT ] && echo "Not found drupal root path" && exit 1
[ -f $CURRENT_SCRIPT_PATH/$CURRENT_SCRIPT_NAME.log ] && rm $CURRENT_SCRIPT_PATH/$CURRENT_SCRIPT_NAME.log

# Check options
OPT_VERBOSE=false
if [ "$(echo $* | xargs -n1 | grep -E '^-v$')" != "" ]
then
  OPT_VERBOSE=true
fi
OPT_DRYRUN=false
if [ "$(echo $* | xargs -n1 | grep -E '^--dry-run$')" != "" ]
then
  OPT_DRYRUN=true
fi

# Execution
log "[$(date +"%Y-%m-%d %H:%M:%S")] Execution started"
log "Drupal root: $DRUPAL_ROOT"
log "Source path: $CURRENT_SCRIPT_PATH"
log "Script name: $CURRENT_SCRIPT_NAME"
if [ -f "$DRUPAL_ROOT/vendor/bin/drush" ]
then
  cmd "$DRUPAL_ROOT/vendor/bin/drush cron -v"
  checkError "Could not execute Drupal cron"
  echo -e "\xe2\x9c\xa8 Cron executed successfully!"
else 
  error "Not found \"$DRUPAL_ROOT/vendor/bin/drush\""
fi
log "[$(date +"%Y-%m-%d %H:%M:%S")] Execution completed"
exit 0