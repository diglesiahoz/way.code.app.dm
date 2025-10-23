#!/bin/bash

# Examples:
# ./common.sh cron_jobs <domain>

if [ "$(basename "$(test -L "$0" && readlink "$0" || echo "$0")")" != "common.sh" ]
then
  echo  "Usage: $(dirname $(test -L "$0" && readlink "$0" || echo "$0"))/common.sh cron_jobs <domain> [--dry-run|--log|--force]"
  exit 1
else
  DOMAIN="$(echo "$ARGS" | awk '{ print $1 }')"
  if [ "$DOMAIN" = "" ]
  then
    error "Required domain"
    exit 1
  fi
  if [ -f "$DRUPAL_ROOT/vendor/bin/drush" ]
  then
    cmd "$DRUPAL_ROOT/vendor/bin/drush cron -v --uri $DOMAIN"
    checkError "Could not execute Drupal cron"
    O=$($CURRENT_SCRIPT_PATH/common.sh fix_perm)
    write_to_log "$O"
  else 
    error "Not found \"$DRUPAL_ROOT/vendor/bin/drush\""
  fi
fi