# dm.exec

📂 `app/custom/app/dm/config/proc/exec.yml`


### Código
```yml
help: Accede a entorno o ejecuta comando
example:
  - '(({}.tmp.proc.sig)) whoami'
  - '(({}.tmp.proc.sig)) ls -la'
  - >-
    (({}.tmp.proc.sig)) vendor/bin/phpstan.phar analyze web/modules/custom
    --memory-limit=256M
task:
  require:
    config:
      - .*(\.local|\.dev|\.test|\.pre|\.stage|\.prod) origin
    args:
      command:
        required: true
        type: .*
        default: /bin/bash
    opt: {}
    settings: {}
  do:
    - event: origin startup
    - call: dm.makeExec
      args:
        cmd: '(({}.args.command))'
    - event: origin windup
```