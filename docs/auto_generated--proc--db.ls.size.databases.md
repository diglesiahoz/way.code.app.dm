### db.ls.size.databases

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
      check:
        data: 
          -
            key: (({origin}._env))
            is: equal
            value: local
        true:
          - 
            call: var
            args: 
              key: signature
              value: docker exec -i -e MYSQL_PWD=(({origin}.appsetting.service.db.pass)) (({origin}._tag))-db (({}.var.db_exec)) -h (({origin}.appsetting.service.db.host)) -u (({origin}.appsetting.service.db.user))
        false:
          - 
            call: var
            args: 
              key: signature
              value: MYSQL_PWD=(({origin}.appsetting.service.db.pass)) (({}.var.db_exec)) -h (({origin}.appsetting.service.db.host)) -u (({origin}.appsetting.service.db.user))
    # Necesario implementar hook en perfil para entornos remotos, 
    # si para ejecutar consulta de debe de acceder a servidor (leap_from)
    #
    # Ejemplo:
    # ========
    # hook:
    #   call:
    #     dm.db.ls.size.database:
    #       exec: ((server_access))
    -
      call: exec
      args:
        message: ""
        cmd: (({}.var.signature)) -B -e "SELECT table_schema AS \"Database\",ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS \"Size (MB)\" FROM information_schema.TABLES GROUP BY table_schema ORDER BY SUM(data_length + index_length) DESC;" | tail -n +2 | xargs printf "%-25s %s\n"
        out: true
    - { event: 'origin windup' }
```
[```config/proc/db.ls.size.databases.yml```](../config/proc/db.ls.size.databases.yml)
