### ls.db.size.database

```yml
help: Muestra tamaño de bases de datos
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
        cmd: docker exec -i (({origin}.appsetting.tag))-db (({}.var.service_db_exec)) -B -e "SELECT table_schema AS \"Database\",ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS \"Size (MB)\" FROM information_schema.TABLES GROUP BY table_schema;" | tail -n +2 | xargs printf "%-25s %s\n"
        out: true
    - { event: 'origin windup' }
```
[```config/proc/ls.db.size.database.yml```](../config/proc/ls.db.size.database.yml)