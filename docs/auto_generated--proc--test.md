### test

```yml
help: Ejecuta test
example:
- (({}.tmp.proc.sig))
task:
  complete: []
  require:
    config: []
    args: {}
    opt: {}
  do:
    - { event: 'origin startup' }
    - call: dm.main
    - call: out
    - { event: 'origin windup' }
```
[```config/proc/test.yml```](../config/proc/test.yml)
