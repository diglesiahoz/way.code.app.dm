### @proxy.local

```yml
_pwd: (({}.user.homedir))/project/.dm
appsetting:
  tag: ((._tag))
  key: ((._key))
  root: ((_pwd))
  stack: proxy
  wildcard_host: ((._key))
  service:
    proxy:
      host: ((_env)).((appsetting.wildcard_host))
      base_image: traefik:v3.1
hook:
  call: {}
  event:
    dm.init:
      startup: {}
      windup: {}
      #
      # issue: problema al usar certificados generados en docker y usarlos en el navegador del host
      #
      # windup:
      #   - { call: dm.makeCerts }
```
[```config/@/proxy/proxy.local.yml```](../config/@/proxy/proxy.local.yml)
