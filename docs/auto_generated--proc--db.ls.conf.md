### db.ls.conf

```yml
help: Muestra configuración de base de datos
example:
- (({}.tmp.proc.sig))
task:
  require:
    config:
      - .*(\.local|\.dev|\.test|\.pre|\.stage) origin
  do:
    - { event: 'origin startup' }
    -
      call: dm.setDbExec
      args:
        base_image: (({origin}.appsetting.service.db.base_image))
    -
      call: exec
      args:
        message: ""
        cmd: docker exec -i -e MYSQL_PWD=(({origin}.appsetting.service.db.pass)) (({origin}._parent_key))-db (({}.var.db_exec)) -h (({origin}.appsetting.service.db.host.sv)) -u (({origin}.appsetting.service.db.user)) -B -e "SHOW variables"
        out: true
    - { event: 'origin windup' }
```
[```config/proc/db.ls.conf.yml```](../config/proc/db.ls.conf.yml)
