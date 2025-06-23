#!/bin/bash

if [ "$APPSETTING_NOTIFY_ENABLE" = true ]
then
  cmd "timeout 5 /usr/bin/swaks --from \"$APPSETTING_NOTIFY_EMAIL_FROM\" --to \"$APPSETTING_NOTIFY_EMAIL_TO\" --header \"Subject: Deployment ${EXIT_STATUS^^} from ${APPSETTING_ENV^^}\" --body \"$EXIT_MESSAGE\" > /dev/null"
  checkError "The notification could not be sent."
else
  log "Email notifications disabled"
fi
