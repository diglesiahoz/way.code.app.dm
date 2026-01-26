# dm.share

📂 `app/custom/app/dm/config/proc/share.yml`


### Código
```yml
help: Comparte aplicación a través de Ngrok
example:
  - '(({}.tmp.proc.sig))'
task:
  require:
    config:
      - .*(\.local) origin
    args: {}
  do:
    - event: origin startup
    - call: exec
      args:
        cmd: >-
          (({}.exec)) (({origin}._config_name)) exec ngrok config add-authtoken
          (({origin}.appsetting.service.www.ngrok.token))
        out: false
    - call: exec
      args:
        cmd: >-
          (({}.exec)) (({origin}._config_name)) exec ngrok http
          (({origin}.appsetting.service.www.host))
        out: true
    - event: origin windup
```