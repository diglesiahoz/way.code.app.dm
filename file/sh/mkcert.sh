#!/bin/bash

EXEC="docker exec -it -u $USER way_code-app /usr/bin/node $WAY_CODE_APP_ROOT"

CERTS_PATH=`$EXEC @dm.proxy.local.._pwd -ro | tr -d "[\"]"`

a=$($EXEC @*..appsetting.wildcard_host -ro | tr -d "[\"]" | tr ',' ' ' 2>/dev/null)
if [ $? = 1 ]
then
  echo ERROR
  exit 1
fi

for DOMAIN in $($EXEC @*..appsetting.wildcard_host -ro | tr -d "[\"]" | tr ',' ' ')
do 
  ALL_DOMAINS+="${DOMAIN} *.${DOMAIN} "
done

mkcert -install
mkcert -cert-file ${CERTS_PATH}/certs/dm--cert.pem -key-file ${CERTS_PATH}/certs/dm--key.pem ${ALL_DOMAINS}
