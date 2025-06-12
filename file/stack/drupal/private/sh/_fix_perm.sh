#!/bin/bash

# Examples:
# ./common.sh fix_perm

if [ "$(basename "$(test -L "$0" && readlink "$0" || echo "$0")")" != "common.sh" ]
then
  echo  echo  "Usage: $(dirname $(test -L "$0" && readlink "$0" || echo "$0"))/common.sh fix_perm [--dry-run|--log|--force]"
  exit 1
else
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

  log "Fix perm: $REL_PATH_SITES/*/files/ \( -not -user $SERVER_USER -o -not -group $SERVER_USER \)"
  cmd "cd $DRUPAL_ROOT && sudo find $REL_PATH_SITES/*/files/ \( -not -user $SERVER_USER -o -not -group $SERVER_USER \) -exec chown $SERVER_USER:$SERVER_USER '{}' \;"
  checkError

  log "Fix drush perm..."
  cmd "cd $DRUPAL_ROOT && sudo chmod u+x,g+x vendor/bin/drush"
  checkError
fi