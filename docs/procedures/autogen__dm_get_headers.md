# dm.get.headers

📂 `app/custom/app/dm/config/proc/get.headers.yml`


### Código
```yml
help: Ejecuta comando curl
example:
  - '(({}.tmp.proc.sig)) /my-url'
task:
  require:
    config:
      - .*(\.local|\.dev|\.test|\.pre|\.stage|\.prod) origin
    args:
      rel_url:
        required: false
        type: .*
        default: /
    settings: {}
  do:
    - event: origin startup
    - call: exec
      args:
        cmd: >-
          docker exec --user (({}.user.username)) -it
          (({origin}.appsetting.service.www.host)) curl -kIs
          (({origin}.appsetting.service.www.curl))(({}.args.rel_url))
        out: true
    - event: origin windup
```