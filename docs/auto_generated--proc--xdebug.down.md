### xdebug.down

```yml
example:
 - (({}.tmp.proc.sig))
task:
  require:
    config:
      - .*(\.local) origin
  do:
    - { event: 'origin startup' }
    - { call: exec, args: { cmd: 'docker exec -it (({origin}.appsetting.tag))-www sudo phpdismod xdebug', out: true } }
    - { event: 'origin windup' }
```
[```config/proc/xdebug.down.yml```](../config/proc/xdebug.down.yml)
