### ls.db.conf

```yml
help: Muestra configuración de base de datos
example:
- (({}.tmp.proc.sig))
task:
  require:
    config:
      - .*(\.local) origin
  do:
    - { event: 'origin startup' }
    -
      call: dm.setExecDbService
      args:
        base_image: (({origin}.appsetting.service.db.base_image))
    -
      call: exec
      args:
        message: ""
        cmd: docker exec -i (({origin}.appsetting.tag))-db (({}.var.service_db_exec)) -B -e "SHOW variables"
        out: true
    - { event: 'origin windup' }
```
[```config/proc/ls.db.conf.yml```](../config/proc/ls.db.conf.yml)
