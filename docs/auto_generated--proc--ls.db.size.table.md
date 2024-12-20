### ls.db.size.table

```yml
help: Muestra tamaño de las tablas de la base de datos
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
        cmd: docker exec -i (({origin}.appsetting.tag))-db (({}.var.service_db_exec)) -B -e "SELECT table_name AS \"Table\",ROUND(((data_length + index_length) / 1024 / 1024), 2) AS \"Size (MB)\" FROM information_schema.TABLES WHERE table_schema = \"(({origin}.appsetting.service.db.name))\" ORDER BY (data_length + index_length);" | tail -n +2 | sort -u | xargs printf "%-50s %s\n"
        out: true
    - { event: 'origin windup' }
```
[```config/proc/ls.db.size.table.yml```](../config/proc/ls.db.size.table.yml)
