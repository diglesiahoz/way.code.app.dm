#!/usr/bin/env sh
set -e && \
echo "USER:$(whoami), UID:$(id -u), GID:$(id -g)" && \
/etc/init.d/$(ls /etc/init.d/ | xargs -n1 | grep '^php.*\-fpm$') start && \
nginx -g 'daemon off;'