#!/bin/bash

# Examples:
# ./common.sh deploy themes/custom/memora/sass:themes/custom/memora/css
# ./common.sh deploy themes/custom/memora/sass:themes/custom/memora/css --force

if [ "$(basename "$(test -L "$0" && readlink "$0" || echo "$0")")" != "common.sh" ] || [ "$(echo $ARGS | awk '{ print $1 }')" = "" ]
then
  echo  "Usage: $(dirname $(test -L "$0" && readlink "$0" || echo "$0"))/common.sh deploy <sass-mapping> [--dry-run|--log|--force|--fast]"
  exit 1
else
  if [ "$OPT_FAST" = true ]
  then
    log "Fix drush perm..."
    cmd "cd $DRUPAL_ROOT && sudo chmod u+x,g+x vendor/bin/drush"
    checkError
    log "Downloading code from repository..."
    DEPLOY_BRANCH=$(cd $DRUPAL_ROOT && git rev-parse --abbrev-ref HEAD)
    cmd "cd $DRUPAL_ROOT && git pull origin $DEPLOY_BRANCH"
    if [ "$(echo "$EVAL_OUTPUT" | grep -E "^Aborting$")" = "Aborting" ]
    then
      error "Aborted"
    fi
    $CURRENT_SCRIPT_PATH/common.sh compile $(echo $ARGS | awk '{ print $1 }')
    log "Rebuilding cache..."
    cmd "cd $DRUPAL_ROOT && vendor/bin/drush cr -y"
    checkError
  else
    log "Fix drush perm..."
    cmd "cd $DRUPAL_ROOT && sudo chmod u+x,g+x vendor/bin/drush"
    checkError

    if [ "$OPT_FORCE" = false ]
    then 
      log "Checking differences between database and config files..."
      if [ "$OPT_DRYRUN" = false ]
      then
        CONFIG_DIFF=$(cd $DRUPAL_ROOT && vendor/bin/drush config:status 2>&1)
        if [ "$(echo "$CONFIG_DIFF" | grep "No differences between DB and sync directory")" = "" ]
        then
          echo "$CONFIG_DIFF"
          error "Deployment aborted due to differences between database and configuration files"
          exit 1
        fi
      fi
    else 
      log "Skip differences between database and config files..."
    fi

    # log "Enable maintenance mode"
    # cmd "sudo a2ensite maintenance.test.memora.es.conf > /dev/null 2>&1 && sudo systemctl reload apache2"
    # checkError

    log "Downloading code from repository..."
    DEPLOY_BRANCH=$(cd $DRUPAL_ROOT && git rev-parse --abbrev-ref HEAD)
    cmd "cd $DRUPAL_ROOT && git pull origin $DEPLOY_BRANCH"
    if [ "$(echo "$EVAL_OUTPUT" | grep -E "^Aborting$")" = "Aborting" ]
    then
      error "Aborted"
    fi

    log "Installing dependencies..."
    cmd "cd $DRUPAL_ROOT && composer install"
    checkError

    $CURRENT_SCRIPT_PATH/common.sh compile $(echo $ARGS | awk '{ print $1 }')

    $CURRENT_SCRIPT_PATH/common.sh fix_perm

    log "Updating database..."
    cmd "cd $DRUPAL_ROOT && vendor/bin/drush updb -y"
    checkError

    log "Importing configuration..."
    cmd "cd $DRUPAL_ROOT && vendor/bin/drush cim -y"
    checkError

    log "Rebuilding cache..."
    cmd "cd $DRUPAL_ROOT && vendor/bin/drush cr -y"
    checkError

    # log "Disable maintenance mode"
    # cmd "sudo a2dissite maintenance.test.memora.es.conf > /dev/null 2>&1 && sudo systemctl reload apache2"
    # checkError
  fi
fi