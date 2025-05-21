### env

```yml
help: Obtiene variables de entorno
example:
- (({}.tmp.proc.sig))
task:
  require:
    config:
      - .*(\.local|\.dev|\.test|\.pre|\.prod) origin
    args: {}
    settings: {}
  do:
    - { event: 'origin startup' }
    -
      call: exec
      args:
        cmd: docker exec --user (({}.user.username)) -it (({origin}._parent_key))-www printenv | sort
        out: true
    - { event: 'origin windup' }
```
[```config/proc/env.yml```](../config/proc/env.yml)
