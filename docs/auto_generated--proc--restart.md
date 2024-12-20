### restart

```yml
help: Re-inicia servicios
example:
 - (({}.tmp.proc.sig))
task:
  require:
    config:
      - .*(\.local) origin
  do:
    - { event: 'origin startup' }
    - { call: exec, args: { cmd: "(({}.exec)) (({origin}._config_name)) dm.down", out: true }}
    - { call: exec, args: { cmd: "(({}.exec)) (({origin}._config_name)) dm.up", out: true }}
    - { event: 'origin windup' }    
```
[```config/proc/restart.yml```](../config/proc/restart.yml)