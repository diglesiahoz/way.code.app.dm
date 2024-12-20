### @test.nginxphp.local

```yml
_pwd: (({}.user.homedir))/project/((._key))
appsetting:
  env: ((._env))
  tag: ((._tag))
  key: ((._key))
  root: ((._pwd))
  stack: nginx-php
  wildcard_host: ((._key))
  path:
    backup_db: ((_pwd))/private/db
  service:
    www:
      base_image: ubuntu:22.04
      host: ((_env)).((appsetting.wildcard_host))
      php:
        release: 8.3
      composer:
        release: 2
      root: wwwroot
hook:
  call: {}
  event: {}
```
[```config/@/test/test.nginxphp.local.yml```](../config/@/test/test.nginxphp.local.yml)
