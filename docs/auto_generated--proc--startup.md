### startup

```yml
help: Ejecuta test
example:
- (({}.tmp.proc.sig))
task:
  complete: []
  require:
    config:
      - .*(\.local) origin
    args: {}
    opt: {}
  do:
    - { event: 'origin startup' }
    - { call: loadEnv }
    - { call: exec, args: { cmd: "(({}.var.env)); [ -f (({origin}.appsetting.root))/.dm/custom/sh/startup.sh ] && (({origin}.appsetting.root))/.dm/custom/sh/startup.sh" } }
    - { event: 'origin windup' }
```
[```config/proc/startup.yml```](../config/proc/startup.yml)
