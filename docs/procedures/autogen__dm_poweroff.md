# dm.poweroff

📂 `app/custom/app/dm/config/proc/poweroff.yml`


### Código
```yml
help: Desconecta servicios y redes gestionados por la aplicación
example:
  - '(({}.tmp.proc.sig))'
task:
  require:
    config: {}
    opt:
      all:
        type: Boolean
        default: false
  do:
    - event: origin startup
    - call: dm.powerOff
    - event: origin windup
```