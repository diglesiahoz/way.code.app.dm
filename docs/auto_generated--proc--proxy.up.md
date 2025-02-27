### proxy.up

```yml
help: "Levanta proxy"
example:
 - (({}.tmp.proc.sig))
task:
  require: { }
  do:
    - { event: 'origin startup' }
    - { call: exec, args: { cmd: "(({}.exec)) @dm.proxy.local dm.up (({}.optSig))" }}
    - { event: 'origin windup' }
```
[```config/proc/proxy.up.yml```](../config/proc/proxy.up.yml)
