### db.ls.databases

```yml
help: Muestra tamaño de las tablas de la base de datos
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
        cmd: docker exec -i -e MYSQL_PWD=(({origin}.appsetting.service.db.pass)) (({origin}._tag))-db (({}.var.db_exec)) -h (({origin}.appsetting.service.db.host)) -u (({origin}.appsetting.service.db.user)) -e "SHOW DATABASES;" | tail -n +2
        out: true
    - { event: 'origin windup' }
```
[```config/proc/db.ls.databases.yml```](../config/proc/db.ls.databases.yml)
