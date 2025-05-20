#!/bin/bash

# Examples:
# /opt/sh/common.sh cron_jobs

if [ "$(basename "$(test -L "$0" && readlink "$0" || echo "$0")")" != "common.sh" ]
then
  echo  "Usage: /opt/sh/common.sh cron_jobs [--dry-run|--log|--force]"
  exit 1
else
  if [ -f "$DRUPAL_ROOT/vendor/bin/drush" ]
  then
    cmd "$DRUPAL_ROOT/vendor/bin/drush cron -v"
    checkError "Could not execute Drupal cron"
    . $CURRENT_SCRIPT_PATH/_fix_perm.sh
  else 
    error "Not found \"$DRUPAL_ROOT/vendor/bin/drush\""
  fi
fi