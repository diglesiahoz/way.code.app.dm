### init

```yml
help: Despliega código
example:
 - (({}.tmp.proc.sig))
task:
  require:
    config:
      - .*(\.local) origin
    opt: {}
  do:
    - { event: 'origin startup' }
    - { call: dm.init, args: { name: "(({origin}.appsetting.stack))", remove_all: false, force: "(({}.opt.f))" } }
    - { event: 'origin windup' }   
```
[```config/proc/init.yml```](../config/proc/init.yml)
