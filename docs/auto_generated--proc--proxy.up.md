### proxy.up

```yml
help: "Levanta servicios"
example:
 - (({}.tmp.proc.sig))
task:
  require: { }
  do:
    - { event: 'origin startup' }
    - { call: exec, args: { cmd: "(({}.exec)) @dm.proxy.local dm.init -vf" }}
    - { call: exec, args: { cmd: "(({}.exec)) @dm.proxy.local dm.up -v" }}
    - { event: 'origin windup' }
```
[```config/proc/proxy.up.yml```](../config/proc/proxy.up.yml)
