# @dm.proxy.local

📂 `app/custom/app/dm/config/@/proxy/proxy.local.yml`


### Código
```yml
appsetting:
  stack: proxy
  wildcard_host:
    - ((_env)).((_key))
  service:
    proxy:
      base_image: 'traefik:v3.6.13'
      extra_commands: []
      host: ((appsetting.wildcard_host.0))
```