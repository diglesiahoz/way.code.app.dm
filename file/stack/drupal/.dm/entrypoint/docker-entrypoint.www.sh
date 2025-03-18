#!/usr/bin/env sh
set -e
echo "USER:$(whoami), UID:$(id -u), GID:$(id -g)"
echo "127.0.0.1       $APPSETTING_SERVICE_WWW_DOMAIN" >> /etc/hosts
echo /etc/init.d/$(ls /etc/init.d/ | xargs -n1 | grep '^php.*\-fpm$') start
/etc/init.d/$(ls /etc/init.d/ | xargs -n1 | grep '^php.*\-fpm$') start
[ "$APPSETTING_SERVICE_WWW_WEBSERVER" = "apache2" ] && /usr/sbin/apache2ctl -D FOREGROUND
[ "$APPSETTING_SERVICE_WWW_WEBSERVER" = "nginx" ] && nginx -g 'daemon off;'