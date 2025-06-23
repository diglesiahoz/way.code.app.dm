#!/bin/bash

if [ "$APPSETTING_NOTIFY_ENABLE" = true ]
then
  cmd "timeout 5 /usr/bin/swaks --to diglesia@opentrends.net --header \"Subject: Deploy ${APPSETTING_ENV^^} ${EXIT_STATUS^^}\" --body \"$EXIT_MESSAGE\" > /dev/null"
  checkError "The notification could not be sent."
else
  log "Email notifications disabled"
fi
