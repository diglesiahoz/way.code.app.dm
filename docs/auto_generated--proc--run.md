### run

```yml
help: Ejecuta comandos personalizados
example:
- (({}.tmp.proc.sig)) deploy
task:
  require:
    config:
      - .*(\.local|\.dev|\.test|\.pre) origin
    args:
      run_name:
        type: String
        required: true
        default: callback::dm.getHookEventKeys
    opt: {}
    settings: {}
  do:
    - { event: 'origin (({}.args.run_name))' }
```
[```config/proc/run.yml```](../config/proc/run.yml)
