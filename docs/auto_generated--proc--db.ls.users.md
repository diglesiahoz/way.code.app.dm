### db.ls.users

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
      call: dm.setDbExec
      args:
        base_image: (({origin}.appsetting.service.db.base_image))
    -
      call: exec
      args:
        message: ""
        cmd: docker exec -i -e MYSQL_PWD=(({origin}.appsetting.service.db.pass)) (({origin}.appsetting.tag))-db (({}.var.db_exec)) -h (({origin}.appsetting.service.db.host.sv)) -u (({origin}.appsetting.service.db.user)) -e "SELECT user,host FROM mysql.user;" | tail -n +2 | xargs printf "%-25s %s\n"
        out: true
    - { event: 'origin windup' }
```
[```config/proc/db.ls.users.yml```](../config/proc/db.ls.users.yml)
