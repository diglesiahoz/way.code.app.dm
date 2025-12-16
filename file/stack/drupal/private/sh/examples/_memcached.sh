#!/bin/bash

# Examples:
# ./common.sh memcached stats
# ./common.sh memcached flush_all

if [ "$(basename "$(test -L "$0" && readlink "$0" || echo "$0")")" != "common.sh" ]
then
  echo  "Usage: $(dirname $(test -L "$0" && readlink "$0" || echo "$0"))/common.sh memcached [command] [--dry-run|--log|--force]"
  exit 1
else
  if [ "$APPSETTING_SERVICE_MEMCACHED_HOST" != "" ]
  then
    MEMCACHED_HOST=$APPSETTING_SERVICE_MEMCACHED_HOST
  else
    MEMCACHED_HOST="127.0.0.1"
  fi
  MEMCACHED_PORT="11211"

  # See: https://docs.memcached.org/protocols/basic/
  MEMCACHED_NUM_CMD=$(echo $ARGS | xargs -n1 | grep -v '^-' | wc -w)
  if [ "$MEMCACHED_NUM_CMD" != "1" ]
  then
    MEMCACHED_CMD="stats"
  else
    MEMCACHED_CMD=$(echo $ARGS | xargs | awk -F' ' '{print $1}')
  fi

  log "Running \"$MEMCACHED_CMD\" on \"$MEMCACHED_HOST:$MEMCACHED_PORT\""
  cmd "(sleep 0.1; echo \"$MEMCACHED_CMD\"; sleep 0.1; echo \"quit\";) | telnet $MEMCACHED_HOST $MEMCACHED_PORT"
  checkError
fi
