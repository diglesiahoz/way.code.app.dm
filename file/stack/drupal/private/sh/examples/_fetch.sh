#!/bin/bash

# Examples:
# /opt/sh/common.sh fetch <domain>

if [ "$(basename "$(test -L "$0" && readlink "$0" || echo "$0")")" != "common.sh" ]
then
  echo  "Usage: /opt/sh/common.sh fetch <domain> [--dry-run|--log|--force]"
  exit 1
else
  DOMAIN="$(echo "$ARGS" | awk '{ print $1 }')"
  if [ "$DOMAIN" = "" ]
  then
    error "Required domain"
    exit 1
  fi
  echo "Parsing \"$DOMAIN\" from \"$(hostname)\""
  OUTPUT=$(curl -ksL $DOMAIN/sitemap.xml |  grep -o "<loc>[^<]*" | sed -e 's/<[^>]*>//g')
  if [ "$OUTPUT" != "" ]
  then
    OUTPUT=$(echo "$OUTPUT" | xargs -n1 | uniq | sort | uniq)
    COUNTER=0
    COUNTER_CHECK=0
    MAX=10000
    ALL=""
    LINKS_NUM_TO_PARSE=$(echo "$OUTPUT" | wc -l)
    echo "Cheaking $LINKS_NUM_TO_PARSE links..."
    while IFS= read -r URL; do
      REL_PATH=$(echo $URL | sed -e 's/^https:\/\///g' | cut -d'/' -f2-)
      IFS='/' read -a array <<< "$REL_PATH"
      DEPTH=${#array[@]}
      if [ $DEPTH = 1 ]
      then
        echo 
        echo "[$COUNTER_CHECK - $LINKS_NUM_TO_PARSE] Analyzing: $DOMAIN/$REL_PATH"
        CURL_OUTPUT=$(curl -kIs $DOMAIN/$REL_PATH -H "User-Agent: CustomFetchHTTPClient" 2>/dev/null)
        echo "$CURL_OUTPUT" | grep -E "[C|c]ache"
        COUNTER_CHECK=$(expr $COUNTER_CHECK + 1)
      fi
      COUNTER=$(expr $COUNTER + 1)
      [ $COUNTER = $MAX ] && break
    done <<< "$OUTPUT"
    echo
  fi
  echo "**********************"
  echo -e "COUNTER:|$COUNTER\nCOUNTER_CHECK:|$COUNTER_CHECK\n" | column -t -s "|"
  echo "**********************"
fi