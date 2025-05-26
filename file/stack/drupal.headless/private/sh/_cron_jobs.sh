#!/bin/bash

# Examples:
# /opt/sh/common.sh cron_jobs <domain>

if [ "$(basename "$(test -L "$0" && readlink "$0" || echo "$0")")" != "common.sh" ]
then
  echo  "Usage: /opt/sh/common.sh cron_jobs <domain> [--dry-run|--log|--force]"
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
    cmd "$DRUPAL_ROOT/vendor/bin/drush cron --uri $DOMAIN -v"
    checkError "Could not execute Drupal cron"
    . $CURRENT_SCRIPT_PATH/_fix_perm.sh
  else 
    error "Not found \"$DRUPAL_ROOT/vendor/bin/drush\""
  fi
fi