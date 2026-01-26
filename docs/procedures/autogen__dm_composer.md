# dm.composer

📂 `app/custom/app/dm/config/proc/composer.yml`


### Código
```yml
help: Ejecuta composer en contenedor
example:
  - '(({}.tmp.proc.sig))'
  - '(({}.tmp.proc.sig)) install'
  - '(({}.tmp.proc.sig)) require drupal/mymodule'
task:
  complete:
    - install
    - update
  require:
    config:
      - .*(\.local) origin
    args:
      command:
        required: false
        type: .*
        default: ''
  do:
    - event: origin startup
    - call: exec
      args:
        cmd: >-
          docker exec --user (({}.user.username)) -it
          (({origin}.appsetting.service.www.host)) composer (({}.args.command))
        out: true
    - event: origin windup
```