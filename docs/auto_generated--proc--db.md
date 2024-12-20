### db

```yml
help: Acceso a base de datos
example:
- (({}.tmp.proc.sig))
- (({}.tmp.proc.sig)) --last --force
task:
  require:
    config:
      - .*(\.local) origin
    args: {}
  do:
    - { event: 'origin startup' }
    -
      call: dm.setExecDbService
      args:
        base_image: (({origin}.appsetting.service.db.base_image))
    -
      call: exec
      args:
        cmd: docker exec -it --user root (({origin}.appsetting.tag))-db (({}.var.service_db_exec))
        out: true 
    - { event: 'origin windup' }
```
[```config/proc/db.yml```](../config/proc/db.yml)