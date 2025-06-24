#!/bin/bash

# Examples:
# ./common.sh _reinstall_patches

if [ "$(basename "$(test -L "$0" && readlink "$0" || echo "$0")")" != "common.sh" ]
then
  echo  "Usage: $(dirname $(test -L "$0" && readlink "$0" || echo "$0"))/common.sh _reinstall_patches [--watch|--dry-run|--log|--force]"
  exit 1
else  
  if command -v jq >/dev/null 2>&1; then
    REINSTALL_PACKAGES=$(jq -r '.extra.patches | keys[]' $DRUPAL_ROOT/composer.json | xargs)
    if [ "$REINSTALL_PACKAGES" != "" ]
    then
      cmd "cd $DRUPAL_ROOT && composer reinstall $REINSTALL_PACKAGES"
      checkError
    else 
      error "Not found packages to reinstall"
    fi
  else
    error "Not found \"jq\" package. Please install with \"sudo apt install jq -y\""
  fi
fi