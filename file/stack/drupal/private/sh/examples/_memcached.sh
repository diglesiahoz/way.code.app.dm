#!/bin/bash

# Examples:
# /opt/sh/common.sh memcached stats
# /opt/sh/common.sh memcached flush_all

if [ "$(basename "$(test -L "$0" && readlink "$0" || echo "$0")")" != "common.sh" ]
then
  echo  "Usage: /opt/sh/common.sh memcached [command] [--dry-run|--log|--force]"
  exit 1
else
  if [ "$APPSETTING_SERVICE_MEMCACHED_HOST_SV" != "" ]
  then
    MEMCACHED_HOST=$APPSETTING_SERVICE_MEMCACHED_HOST_SV
  else
    MEMCACHED_HOST="127.0.0.1"
  fi
  MEMCACHED_PORT="11211"

  MEMCACHED_NUM_CMD=$(echo $ARGS | xargs -n1 | grep -v '^-' | wc -w)
  if [ "$MEMCACHED_NUM_CMD" != "1" ]
  then
    error "Memcache require only one command to execute (detected: $MEMCACHED_NUM_CMD)"
    exit 1
  fi
  # See: https://docs.memcached.org/protocols/basic/
  MEMCACHED_CMD=$(echo $ARGS | xargs | awk -F' ' '{print $1}')

  log "Running \"$MEMCACHED_CMD\" on \"$MEMCACHED_HOST:$MEMCACHED_PORT\""
  cmd "(sleep 0.1; echo \"$MEMCACHED_CMD\"; sleep 0.1; echo \"quit\";) | telnet $MEMCACHED_HOST $MEMCACHED_PORT"
  checkError
fi
