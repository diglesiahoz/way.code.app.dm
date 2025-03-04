### run

```yml
help: Ejecuta scripts personalizados
example:
- (({}.tmp.proc.sig))
task:
  complete: []
  require:
    config:
      - .*(\.local) origin
    args:
      run:
        type: String
        default: callback::dm.getRunCommands
    opt: {}
  do:
    - { event: 'origin startup' }
    - { call: dm.loadRunEnv }
    - { call: exec, args: { cmd: "(({}.var.env)); [ -f (({origin}.appsetting.root))/.dm/custom/run/(({}.args.run)) ] && (({origin}.appsetting.root))/.dm/custom/run/(({}.args.run)) (({}.args._))", out: true } }
    - { event: 'origin windup' }
```
[```config/proc/run.yml```](../config/proc/run.yml)
