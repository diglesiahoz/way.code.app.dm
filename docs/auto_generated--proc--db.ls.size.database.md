### db.ls.size.database

```yml
help: Muestra tamaño de bases de datos
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
        cmd: docker exec -i -e MYSQL_PWD=(({origin}.appsetting.service.db.pass)) (({origin}._parent_key))-db (({}.var.db_exec)) -h (({origin}.appsetting.service.db.host.sv)) -u (({origin}.appsetting.service.db.user)) -B -e "SELECT table_schema AS \"Database\",ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS \"Size (MB)\" FROM information_schema.TABLES GROUP BY table_schema;" | tail -n +2 | xargs printf "%-25s %s\n"
        out: true
    - { event: 'origin windup' }
```
[```config/proc/db.ls.size.database.yml```](../config/proc/db.ls.size.database.yml)
