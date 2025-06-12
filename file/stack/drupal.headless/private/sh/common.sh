#!/bin/bash

# REF: https://utf8-chartable.de/unicode-utf8-table.pl?start=9984&names=-&utf8=string-literal

function log_start_exec() {
  if [ "$OPT_LOG" = true ]
  then
    echo -e "\033[0;33m\xe2\x9c\xb6\033[0m $*" >> $LOG_FILE
  else
    echo -e "\033[0;33m\xe2\x9c\xb6\033[0m $*"
  fi
}
function log() {
  if [ "$OPT_LOG" = true ]
  then
    echo -e "\033[0;34m\xe2\x9e\xa4\033[0m $*" >> $LOG_FILE
  else
    echo -e "\033[0;34m\xe2\x9e\xa4\033[0m $*"
  fi
}
function error() {
  echo -e "\033[0;31m\xe2\x9c\x96\033[0m $*" && exit 1
}
function success() {
  [ "$*" = "" ] && MESSAGE="OK!" || MESSAGE="$*"
  if [ "$OPT_LOG" = true ]
  then
    echo -e "\033[0;32m\xe2\x9c\x94\033[0m $MESSAGE" >> $LOG_FILE
  else
    echo -e "\033[0;32m\xe2\x9c\x94\033[0m $MESSAGE"
  fi
}
function successfully() {
  [ "$*" = "" ] && MESSAGE="OK!" || MESSAGE="$*"
  if [ "$OPT_LOG" = true ]
  then
    echo -e "\xe2\x9c\xa8 $MESSAGE" >> $LOG_FILE
  else
    echo -e "\xe2\x9c\xa8 $MESSAGE"
  fi  
}
function checkError() {
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
    echo -e "\033[0;34m[DRY-RUN]\033[0m $CMD"
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
TO_RUN=$(echo $ARGS | xargs -n1 | head -1)
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
  log_start_exec "[$(date +"%Y-%m-%d %H:%M:%S")] Execution started: $CURRENT_SCRIPT_PATH/_$TO_RUN.sh $ARGS"
  . $CURRENT_SCRIPT_PATH/_$TO_RUN.sh $ARGS
  EXIT_CODE=$?
  FINISH_TIME=$(date +%s)
  SEC=$((FINISH_TIME - START_TIME))
  if [ $EXIT_CODE = 0 ]
  then
    successfully "[$(date +"%Y-%m-%d %H:%M:%S")] ${TO_RUN^} executed successfully! ($(printf '%02dm:%02ds\n' $((SEC%3600/60)) $((SEC%60))))"
  else
    error "[$(date +"%Y-%m-%d %H:%M:%S")] ${TO_RUN^} executed with errors ($(printf '%02dm:%02ds\n' $((SEC%3600/60)) $((SEC%60))))"
  fi
else 
  error "Not found script $CURRENT_SCRIPT_PATH/$TO_RUN.sh"
fi 
