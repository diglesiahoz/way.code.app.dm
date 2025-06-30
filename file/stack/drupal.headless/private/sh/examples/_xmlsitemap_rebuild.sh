#!/bin/bash

# Examples:
# ./common.sh _xmlsitemap_rebuild <domain>

if [ "$(basename "$(test -L "$0" && readlink "$0" || echo "$0")")" != "common.sh" ]
then
  echo  "Usage: $(dirname $(test -L "$0" && readlink "$0" || echo "$0"))/common.sh xmlsitemap_rebuild <domain> [--dry-run|--log]"
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
    cmd "$DRUPAL_ROOT/vendor/bin/drush xmlsitemap:rebuild -v --uri $DOMAIN"
    checkError "Could not rebuild xmlsitemap"
  else 
    error "Not found \"$DRUPAL_ROOT/vendor/bin/drush\""
  fi
fi