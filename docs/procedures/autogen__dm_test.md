# dm.test

📂 `app/custom/app/dm/config/proc/test.yml`


### Código
```yml
help: Ejecuta test
example:
  - '(({}.tmp.proc.sig))'
task:
  complete: []
  require:
    config: []
    args: {}
    opt: {}
  do:
    - event: origin startup
    - call: dm.main
    - call: out
    - event: origin windup
```