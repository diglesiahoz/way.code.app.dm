# dm.proxy.down

📂 `app/custom/app/dm/config/proc/proxy.down.yml`


### Código
```yml
help: Apaga proxy
example:
  - '(({}.tmp.proc.sig))'
task:
  require: {}
  do:
    - event: origin startup
    - call: exec
      args:
        cmd: '(({}.exec)) @dm.proxy.local dm.down (({}.optSig))'
    - event: origin windup
```