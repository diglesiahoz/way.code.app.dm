#!/bin/bash

# Examples:
# ./common.sh fix_perm

if [ "$(basename "$(test -L "$0" && readlink "$0" || echo "$0")")" != "common.sh" ]
then
  echo  echo  "Usage: $(dirname $(test -L "$0" && readlink "$0" || echo "$0"))/common.sh fix_perm [--dry-run|--log|--force]"
  exit 1
else
  cmd "cd $DRUPAL_ROOT && sudo find ./ \( -not -user $DEPLOY_USER -o -not -group $SERVER_USER \) -not -path '$REL_PATH_SITES/*/files/*' -not -path '$REL_PATH_SITES/*/files' -exec chown $DEPLOY_USER:$SERVER_USER '{}' \;"
  checkError

  cmd "cd $DRUPAL_ROOT && sudo find ./ \( -not -user $SERVER_USER -o -not -group $SERVER_USER \) -path '$REL_PATH_SITES/*/files/*' -exec chown $SERVER_USER:$SERVER_USER '{}' \;"
  checkError

  cmd "cd $DRUPAL_ROOT && sudo find ./ -type d -not -perm 750 -not -path '$REL_PATH_SITES/*/files/*' -exec chmod 750 '{}' \;"
  checkError

  cmd "cd $DRUPAL_ROOT && sudo find ./ -type f -not -perm 640 -not -executable -not -path '$REL_PATH_SITES/*/files/*' -exec chmod 640 '{}' \;"
  checkError

  cmd "cd $DRUPAL_ROOT && sudo find ./ -type f -not -perm 750 -executable -not -path '$REL_PATH_SITES/*/files/*' -exec chmod 750 '{}' \;"
  checkError

  cmd "cd $DRUPAL_ROOT && sudo find $REL_PATH_SITES/*/files -type d -not -perm 770 -exec chmod 770 '{}' \;"
  checkError

  cmd "cd $DRUPAL_ROOT && sudo find $REL_PATH_SITES/*/files -type f -not -perm 660 -not -executable -exec chmod 660 '{}' \;"
  checkError

  cmd "cd $DRUPAL_ROOT && sudo find $REL_PATH_SITES/*/files -type f -not -perm 770 -executable -exec chmod 770 '{}' \;"
  checkError

  cmd "cd $DRUPAL_ROOT && sudo find $REL_PATH_SITES/*/files/ \( -not -user $SERVER_USER -o -not -group $SERVER_USER \) -exec chown $SERVER_USER:$SERVER_USER '{}' \;"
  checkError

  cmd "cd $DRUPAL_ROOT && sudo find $REL_PATH_SITES/*/private -type d -not -perm 770 -exec chmod 770 '{}' \;"
  checkError
fi