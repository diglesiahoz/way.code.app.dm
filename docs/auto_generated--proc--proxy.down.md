### proxy.down

```yml
help: "Apaga proxy"
example:
 - (({}.tmp.proc.sig))
task:
  require: { }
  do:
    - { event: 'origin startup' }
    - { call: exec, args: { cmd: "(({}.exec)) @dm.proxy.local dm.down (({}.optSig))" }}
    - { event: 'origin windup' }
```
[```config/proc/proxy.down.yml```](../config/proc/proxy.down.yml)
