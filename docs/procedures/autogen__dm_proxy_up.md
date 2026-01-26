# dm.proxy.up

📂 `app/custom/app/dm/config/proc/proxy.up.yml`


### Código
```yml
help: Levanta proxy
example:
  - '(({}.tmp.proc.sig))'
task:
  require: {}
  do:
    - event: origin startup
    - call: exec
      args:
        cmd: '(({}.exec)) @dm.proxy.local dm.up (({}.optSig))'
    - event: origin windup
```