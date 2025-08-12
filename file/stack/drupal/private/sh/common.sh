#!/bin/bash

# REF: https://getemoji.com/#symbols

function log_running() {
  if [ "$OPT_LOG" = true ]
  then
    echo -e "🔸 $*" >> $LOG_FILE
  else
    echo -e "🔸 $*"
  fi
}
function log_hook() {
  if [ "$OPT_LOG" = true ]
  then
    echo -e "🔺 $*" >> $LOG_FILE
  else
    echo -e "🔺 $*"
  fi
}
function log() {
  if [ "$OPT_LOG" = true ]
  then
    echo -e "🔹 $*" >> $LOG_FILE
  else
    echo -e "🔹 $*"
  fi
}
function error() {
  if [ "$2" = "NO_EXIT" ]
  then
    echo -e "❌ $1"
  else
    echo -e "❌ $1" && exit 1
  fi;
}
function success() {
  [ "$*" = "" ] && MESSAGE="OK!" || MESSAGE="$*"
  if [ "$OPT_LOG" = true ]
  then
    echo -e "✅ $MESSAGE" >> $LOG_FILE
  else
    echo -e "✅ $MESSAGE"
  fi
}
function checkError() {
  if [ "$OPT_DRYRUN" = false ]
  then
    if [ $EXIT_CODE != 0 ]
    then
      [ "$*" = "" ] && MESSAGE="Error" || MESSAGE="$*"
      error "$MESSAGE"
    else
      success "OK"
    fi
  fi
}
function cmd() {
  CMD=$1
  if [ "$OPT_DRYRUN" = false ]
  then
    log "$CMD"
    if [ "$OPT_LOG" = true ]
    then
      eval $CMD >> $LOG_FILE 2>&1 
    else
      eval $CMD 2>&1
    fi
    EXIT_CODE=$?
  else 
    echo -e "🔹 [DRY-RUN] $CMD"
  fi
}
function hook() {
  HOOK_FILE=$CURRENT_SCRIPT_PATH/hook/env/$APPSETTING_ENV/$TO_RUN/$1.sh
  # log "--Checking $HOOK_FILE"
  if [ -f $HOOK_FILE ] && [ "$(cat $HOOK_FILE | grep -Ev '^#' | sed -r '/^\s*$/d')" != "" ]
  then
    log_hook "$1 hook started from: $HOOK_FILE"
    . $HOOK_FILE $ARGS
    log_hook "$1 hook finished!"
  fi
  HOOK_FILE=$CURRENT_SCRIPT_PATH/hook/env/all/$TO_RUN/$1.sh
  # log "--Checking $HOOK_FILE"
  if [ -f $HOOK_FILE ] && [ "$(cat $HOOK_FILE | grep -Ev '^#' | sed -r '/^\s*$/d')" != "" ]
  then
    log_hook "$1 hook started from: $HOOK_FILE"
    . $HOOK_FILE $ARGS
    log_hook "$1 hook finished!"
  fi
}

# Set variables
DEPLOY_USER="opentrends"
if ! id "$DEPLOY_USER" >/dev/null 2>&1; then
  DEPLOY_USER=$(whoami)
fi
SERVER_USER="www-data"
CURRENT_SCRIPT_PATH="$( cd -- "$(dirname "$BASH_SOURCE")" >/dev/null 2>&1 ; pwd -P )"
# CURRENT_SCRIPT_LOG_NAME="$(basename "$(test -L "$BASH_SOURCE" && readlink "$BASH_SOURCE" || echo "$BASH_SOURCE")").log"
ARGS=$(echo $* | xargs -n1 | grep -v '^-' | xargs)
OPTS=$(echo $* | xargs -n1 | grep '^-' | xargs)
TO_RUN=$1
if [ "$TO_RUN" = "" ]
then
  for SCRIPT in $(find $CURRENT_SCRIPT_PATH -maxdepth 1 -type f -name '*.sh' | sort)
  do 
    if [ "$(echo $(basename $SCRIPT) | grep -E '^_.*\.sh')" != "" ]
    then 
      OPTIONS+=("$(echo $(basename $SCRIPT) | sed 's/^_//g' | sed 's/\.sh$//g')")
    fi
  done
  PS3='Please enter script to run: '
  select OPT in "${OPTIONS[@]}"
  do
    TO_RUN=$OPT
    break;
  done
  [ "$TO_RUN" = "" ] && error "Not found script to run"
fi
ARGS=$(echo $ARGS | xargs -n1 | grep -v "$TO_RUN" | xargs)
LOG_DIR=/opt/log
if [ ! -d $LOG_DIR ]
then
  error "Not found log dir: $LOG_DIR"
else
  LOG_FILE=$LOG_DIR/$TO_RUN.log
fi

if [ "$APPSETTING_SERVICE_WWW_TARGET" != "" ]
then
  DRUPAL_ROOT=$APPSETTING_SERVICE_WWW_TARGET
else
  DRUPAL_ROOT=$(dirname $(dirname $CURRENT_SCRIPT_PATH))/drupal
  [ ! -d $DRUPAL_ROOT ] && echo "Not found drupal root path" && exit 1
fi

REL_PATH_SITES=$(cd $DRUPAL_ROOT && sudo find . -maxdepth 2 -type d -name "sites" | xargs)
if [ "$REL_PATH_SITES" = "" ]
then
  error "Not found sites path"
fi

# Check options
OPT_V=false
if [ "$(echo $* | xargs -n1 | grep -E '^--v$')" != "" ]
then
  OPT_V=true
fi
OPT_LOG=false
if [ "$(echo $* | xargs -n1 | grep -E '^--log$')" != "" ]
then
  OPT_LOG=true
fi
OPT_DRYRUN=false
if [ "$(echo $* | xargs -n1 | grep -E '^--dry-run$')" != "" ]
then
  OPT_DRYRUN=true
fi
OPT_FORCE=false
if [ "$(echo $* | xargs -n1 | grep -E '^--force$')" != "" ]
then
  OPT_FORCE=true
fi
OPT_FAST=false
if [ "$(echo $* | xargs -n1 | grep -E '^--fast$')" != "" ]
then
  OPT_FAST=true
fi

#column -t -s "|" <<EOF
#**********************
#* DEPLOY_USER:|$DEPLOY_USER
#* SERVER_USER:|$SERVER_USER
#* CURRENT_SCRIPT_PATH:|$CURRENT_SCRIPT_PATH
#* LOG_FILE:|$LOG_FILE
#* TO_RUN:|$TO_RUN
#* ARGS:|$ARGS
#* DRUPAL_ROOT:|$DRUPAL_ROOT
#* REL_PATH_SITES:|$REL_PATH_SITES
#* OPT_LOG:|$OPT_LOG
#* OPT_DRYRUN:|$OPT_DRYRUN
#* OPT_FORCE:|$OPT_FORCE
#**********************
#EOF

[ -f $LOG_FILE ] && rm $LOG_FILE

if [ $OPT_V = true ]
then
  log "**********************************"
  log "DEPLOY_USER: $DEPLOY_USER"
  log "SERVER_USER: $SERVER_USER"
  log "CURRENT_SCRIPT_PATH: $CURRENT_SCRIPT_PATH"
  log "LOG_FILE: $LOG_FILE"
  log "TO_RUN: $TO_RUN"
  log "ARGS: $ARGS"
  log "DRUPAL_ROOT: $DRUPAL_ROOT"
  log "REL_PATH_SITES: $REL_PATH_SITES"
  log "OPT_LOG: $OPT_LOG"
  log "OPT_DRYRUN: $OPT_DRYRUN"
  log "OPT_FORCE: $OPT_FORCE"
  log "**********************************"
fi

if [ -f $CURRENT_SCRIPT_PATH/_$TO_RUN.sh ]
then
  START_TIME=$(date +%s)
  if [ -f $CURRENT_SCRIPT_PATH/.env ]
  then
    ENV_SOURCE_DIR=$CURRENT_SCRIPT_PATH
  else
    ENV_SOURCE_DIR=$(dirname $(dirname $CURRENT_SCRIPT_PATH))
  fi
  if [ -f $ENV_SOURCE_DIR/.env ]
  then
    set -a            
    source $ENV_SOURCE_DIR/.env
    set +a
    log "Loaded env file: $ENV_SOURCE_DIR/.env"
  else
    error "Could not load env file from: $ENV_SOURCE_DIR/.env"
  fi
  log_running "[$(date +"%Y-%m-%d %H:%M:%S")] Running: $CURRENT_SCRIPT_PATH/common.sh $TO_RUN $ARGS"
  hook "startup"
  . $CURRENT_SCRIPT_PATH/_$TO_RUN.sh $ARGS
  EXIT_CODE=$?
  FINISH_TIME=$(date +%s)
  SEC=$((FINISH_TIME - START_TIME))
  if [ $EXIT_CODE = 0 ]
  then
    EXIT_STATUS="success"
    EXIT_MESSAGE="[$(date +"%Y-%m-%d %H:%M:%S")] ${TO_RUN^} executed successfully from $(hostname)! ($(printf '%02dm:%02ds\n' $((SEC%3600/60)) $((SEC%60))))"
    success "$EXIT_MESSAGE"
    hook "windup"
  else
    EXIT_STATUS="error"
    EXIT_MESSAGE="[$(date +"%Y-%m-%d %H:%M:%S")] ${TO_RUN^} executed with errors from $(hostname)! ($(printf '%02dm:%02ds\n' $((SEC%3600/60)) $((SEC%60))))"
    error "$EXIT_MESSAGE" "NO_EXIT"
    hook "windup"
  fi
else 
  error "Not found script $CURRENT_SCRIPT_PATH/$TO_RUN.sh"
fi 
