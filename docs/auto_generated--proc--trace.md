### trace

```yml
help: Obtiene información
example:
- (({}.tmp.proc.sig))
task:
  require:
    config:
      - .*(\.local|\.dev|\.test|\.pre|\.stage) origin
    opt:
      name:
        type: String
        default:
  do:
    - { event: 'origin startup' }
    -
      call: dm.makeTrace
      args:
        name: (({}.opt.name))
    - { event: 'origin windup' }
```
[```config/proc/trace.yml```](../config/proc/trace.yml)
