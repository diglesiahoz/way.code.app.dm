#!/bin/bash

# Examples:
# ./common.sh deploy --fast
# ./common.sh deploy --force

if [ "$(basename "$(test -L "$0" && readlink "$0" || echo "$0")")" != "common.sh" ]
then
  echo  "Usage: $(dirname $(test -L "$0" && readlink "$0" || echo "$0"))/common.sh deploy [--dry-run|--log|--force|--fast]"
  exit 1
else
  if [ -z $APPSETTING_COMPILE_MAPPING ]
  then
    error "You must set the \"APPSETTING_COMPILE_MAPPING\" variable in the environment configuration file (.env)"
  fi
  if [ "$OPT_FAST" = true ]
  then

    log "Fix drush perm..."
    cmd "cd $DRUPAL_ROOT && sudo chmod u+x,g+x vendor/bin/drush"
    checkError

    CURRENT_COMMIT=$(git log --pretty=format:"%h" -n 1)
    hook "pre__pull"
    hook "commit/$CURRENT_COMMIT/pre__pull"

    log "Downloading code from repository..."
    DEPLOY_BRANCH=$(cd $DRUPAL_ROOT && git rev-parse --abbrev-ref HEAD)
    cmd "cd $DRUPAL_ROOT && git pull origin $DEPLOY_BRANCH"
    checkError "The code has not been downloaded from the repository"

    CURRENT_COMMIT=$(git log --pretty=format:"%h" -n 1)
    hook "post__pull"
    hook "commit/$CURRENT_COMMIT/post__pull"

    hook "pre__install"
    hook "commit/$CURRENT_COMMIT/pre__install"

    log "Installing dependencies..."
    cmd "cd $DRUPAL_ROOT && composer install"
    checkError

    hook "post__install"
    hook "commit/$CURRENT_COMMIT/post__install"

    hook "pre__compile"
    hook "commit/$CURRENT_COMMIT/pre__compile"

    $CURRENT_SCRIPT_PATH/common.sh compile $APPSETTING_COMPILE_MAPPING $OPTS

    hook "post__compile"
    hook "commit/$CURRENT_COMMIT/post__compile"

  else

    log "Fix drush perm..."
    cmd "cd $DRUPAL_ROOT && sudo chmod u+x,g+x vendor/bin/drush"
    checkError

    if [ "$OPT_FORCE" = false ]
    then 

      hook "pre__cst"
      hook "commit/$CURRENT_COMMIT/pre__cst"

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

      hook "post__cst"
      hook "commit/$CURRENT_COMMIT/post__cst"

    else 
      log "Skip differences between database and config files..."
    fi

    # log "Enable maintenance mode"
    # cmd "sudo a2ensite maintenance.test.memora.es.conf > /dev/null 2>&1 && sudo systemctl reload apache2"
    # checkError

    CURRENT_COMMIT=$(git log --pretty=format:"%h" -n 1)
    hook "pre__pull"
    hook "commit/$CURRENT_COMMIT/pre__pull"

    log "Downloading code from repository..."
    DEPLOY_BRANCH=$(cd $DRUPAL_ROOT && git rev-parse --abbrev-ref HEAD)
    cmd "cd $DRUPAL_ROOT && git pull origin $DEPLOY_BRANCH"
    checkError "The code has not been downloaded from the repository"

    CURRENT_COMMIT=$(git log --pretty=format:"%h" -n 1)
    hook "post__pull"
    hook "commit/$CURRENT_COMMIT/post__pull"

    hook "pre__install"
    hook "commit/$CURRENT_COMMIT/pre__install"

    log "Installing dependencies..."
    cmd "cd $DRUPAL_ROOT && composer install"
    checkError

    hook "post__install"
    hook "commit/$CURRENT_COMMIT/post__install"

    hook "pre__compile"
    hook "commit/$CURRENT_COMMIT/pre__compile"

    $CURRENT_SCRIPT_PATH/common.sh compile $APPSETTING_COMPILE_MAPPING $OPTS

    hook "post__compile"
    hook "commit/$CURRENT_COMMIT/post__compile"

    hook "pre__fixperm"
    hook "commit/$CURRENT_COMMIT/pre__fixperm"

    $CURRENT_SCRIPT_PATH/common.sh fix_perm $OPTS

    hook "post__fixperm"
    hook "commit/$CURRENT_COMMIT/post__fixperm"

    hook "pre__updb"
    hook "commit/$CURRENT_COMMIT/pre__updb"

    log "Updating database..."
    cmd "cd $DRUPAL_ROOT && vendor/bin/drush updb -y"
    checkError

    hook "post__updb"
    hook "commit/$CURRENT_COMMIT/post__updb"

    hook "pre__cim"
    hook "commit/$CURRENT_COMMIT/pre__cim"

    log "Importing configuration..."
    cmd "cd $DRUPAL_ROOT && vendor/bin/drush cim -y"
    checkError

    hook "post__cim"
    hook "commit/$CURRENT_COMMIT/post__cim"

    hook "pre__cr"
    hook "commit/$CURRENT_COMMIT/pre__cr"

    log "Rebuilding cache..."
    cmd "cd $DRUPAL_ROOT && vendor/bin/drush cr -y"
    checkError

    hook "post__cr"
    hook "commit/$CURRENT_COMMIT/post__cr"

    # log "Disable maintenance mode"
    # cmd "sudo a2dissite maintenance.test.memora.es.conf > /dev/null 2>&1 && sudo systemctl reload apache2"
    # checkError
  fi
fi