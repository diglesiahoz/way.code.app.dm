# dm.ls.network

📂 `app/custom/app/dm/config/proc/ls.network.yml`


### Código
```yml
help: Lista redes
example:
  - '(({}.tmp.proc.sig))'
  - '(({}.tmp.proc.sig)) --all'
task:
  require:
    config:
      - .*(\.local) origin
    opt: {}
  do:
    - event: origin startup
    - call: dm.getNetworks
    - event: origin windup
```