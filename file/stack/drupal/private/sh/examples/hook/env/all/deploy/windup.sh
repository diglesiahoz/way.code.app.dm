#!/bin/bash

if [ "$APPSETTING_NOTIFY_ENABLE" = true ]
then
  cmd "timeout 5 /usr/bin/swaks --to $APPSETTING_NOTIFY_EMAIL --header \"Subject: Deployment ${EXIT_STATUS^^} from ${APPSETTING_ENV^^}\" --body \"$EXIT_MESSAGE\" > /dev/null"
  checkError "The notification could not be sent."
else
  log "Email notifications disabled"
fi
