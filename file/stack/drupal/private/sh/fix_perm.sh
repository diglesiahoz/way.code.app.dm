#!/bin/bash

# REF: https://utf8-chartable.de/unicode-utf8-table.pl?start=9984&names=-&utf8=string-literal

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
    EVAL_OUTPUT=$(eval $CMD 2>&1)
    EXIT_CODE=$?
    [ "$EVAL_OUTPUT" != "" ] && echo "$EVAL_OUTPUT"
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
CURRENT_SCRIPT_PATH="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
CURRENT_SCRIPT_NAME="$(basename "$(test -L "$0" && readlink "$0" || echo "$0")")"
DRUPAL_ROOT=$(dirname $(dirname $CURRENT_SCRIPT_PATH))/drupal
[ ! -d $DRUPAL_ROOT ] && echo "Not found drupal root path" && exit 1
[ -f $CURRENT_SCRIPT_PATH/$CURRENT_SCRIPT_NAME.log ] && rm $CURRENT_SCRIPT_PATH/$CURRENT_SCRIPT_NAME.log
REL_PATH_SITES=$(cd $DRUPAL_ROOT && sudo find . -maxdepth 2 -type d -name "sites" | xargs)
if [ "$REL_PATH_SITES" = "" ]
then
  error "Not found sites path"
fi

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
OPT_FORCE=false
if [ "$(echo $* | xargs -n1 | grep -E '^--force$')" != "" ]
then
  OPT_FORCE=true
fi

log "Fix perm: ./ \( -not -user $DEPLOY_USER -o -not -group $SERVER_USER \) -not -path '$REL_PATH_SITES/*/files/*' -not -path '$REL_PATH_SITES/*/files'"
cmd "cd $DRUPAL_ROOT && sudo find ./ \( -not -user $DEPLOY_USER -o -not -group $SERVER_USER \) -not -path '$REL_PATH_SITES/*/files/*' -not -path '$REL_PATH_SITES/*/files' -exec chown $DEPLOY_USER:$SERVER_USER '{}' \;"
checkError

log "Fix perm: ./ \( -not -user $SERVER_USER -o -not -group $SERVER_USER \) -path '$REL_PATH_SITES/*/files/*'"
cmd "cd $DRUPAL_ROOT && sudo find ./ \( -not -user $SERVER_USER -o -not -group $SERVER_USER \) -path '$REL_PATH_SITES/*/files/*' -exec chown $SERVER_USER:$SERVER_USER '{}' \;"
checkError

log "Fix perm: ./ -type d -not -perm 750 -not -path '$REL_PATH_SITES/*/files/*'"
cmd "cd $DRUPAL_ROOT && sudo find ./ -type d -not -perm 750 -not -path '$REL_PATH_SITES/*/files/*' -exec chmod 750 '{}' \;"
checkError

log "Fix perm: ./ -type f -not -perm 640 -not -path '$REL_PATH_SITES/*/files/*'"
cmd "cd $DRUPAL_ROOT && sudo find ./ -type f -not -perm 640 -not -path '$REL_PATH_SITES/*/files/*' -exec chmod 640 '{}' \;"
checkError

log "Fix perm: $REL_PATH_SITES/*/files -type d -not -perm 770"
cmd "cd $DRUPAL_ROOT && sudo find $REL_PATH_SITES/*/files -type d -not -perm 770 -exec chmod 770 '{}' \;"
checkError

log "Fix perm: $REL_PATH_SITES/*/files -type f -not -perm 660"
cmd "cd $DRUPAL_ROOT && sudo find $REL_PATH_SITES/*/files -type f -not -perm 660 -exec chmod 660 '{}' \;"
checkError

log "Fix perm: $REL_PATH_SITES/*/private -type d -not -perm 770"
cmd "cd $DRUPAL_ROOT && sudo find $REL_PATH_SITES/*/private -type d -not -perm 770 -exec chmod 770 '{}' \;"
checkError

log "Fix drush perm..."
cmd "cd $DRUPAL_ROOT && sudo chmod u+x,g+x vendor/bin/drush"
checkError

[ "$OPT_DRYRUN" = false ] && echo -e "\xe2\x9c\xa8 Fix perm completed successfully!"
exit 0