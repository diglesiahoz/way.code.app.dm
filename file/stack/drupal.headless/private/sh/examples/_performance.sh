#!/bin/bash

# Examples:
# watch -n 0.2 /opt/sh/common.sh performance

if [ "$(basename "$(test -L "$0" && readlink "$0" || echo "$0")")" != "common.sh" ]
then
  echo  "Usage: watch -n 0.2 /opt/sh/common.sh performance [--dry-run|--log|--force]"
  exit 1
else
  CORES=$(nproc)
  MEM_FREE=$(cat /proc/meminfo | grep MemFree | awk -F: '{ print $2 }' | awk '{ print $1 }' | xargs)
  MEM_LIMIT=$(cat /etc/php/$(php -v | awk '{ print $2 }' | head -1 | awk -F. '{ print $1"."$2}')/fpm/php.ini | grep memory_limit | awk '{ print $3 }' | sed 's/.$//')
  MEM_AVG=$(ps --no-headers -o "rss,cmd" -C php-fpm$(php -v | awk '{ print $2 }' | head -1 | awk -F. '{ print $1"."$2}') | awk '{ sum+=$1 } END { printf ("%d%s\n", sum/NR/1024," MB") }')

  #echo
  echo "cores:     $CORES"
  echo "mem free:  $MEM_FREE ($(echo $MEM_FREE | awk '{ byte =$1 /1024; print byte " MB" }')) ($(echo $MEM_FREE | awk '{ byte =$1 /1024/1024/1024; print byte " GB" }'))"
  echo "mem limit: $MEM_LIMIT"
  echo "mem avg:   $MEM_AVG"
  #echo

  #PROC=$(ps -eo pid,ppid,user,time,pcpu,%mem,cmd --sort=-%cpu | grep php | grep -v grep)
  #echo "$PROC"

  # top -c -p $(pgrep -d',' -f php)
  # top -b -d 1 -p $(pgrep -d',' -f php)
  # top -b -p $(pgrep -d',' -f php)
  # top -b -p $(pgrep -d',' -f php)

  # top -c -n 1

  PROC_OUTPUT=$(top -c -bn1 -p $(pgrep -d',' -f php) | awk -v RS='\n\n' 'END{printf "%s",$0}')
  echo "$PROC_OUTPUT"

  #echo
fi