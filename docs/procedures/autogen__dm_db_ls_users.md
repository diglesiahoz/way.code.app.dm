# dm.db.ls.users

📂 `app/custom/app/dm/config/proc/db.ls.users.yml`


### Código
```yml
help: Muestra tamaño de las tablas de la base de datos
example:
  - '(({}.tmp.proc.sig))'
task:
  require:
    config:
      - .*(\.local|\.dev|\.test|\.pre|\.stage) origin
  do:
    - event: origin startup
    - call: dm.setDbExec
      args:
        base_image: '(({origin}.appsetting.service.db.base_image))'
    - check:
        data:
          - key: '(({origin}._env))'
            is: equal
            value: local
        'true':
          - call: var
            args:
              key: signature
              value: >-
                docker exec -i -e
                MYSQL_PWD=(({origin}.appsetting.service.db.pass))
                (({origin}._tag))-db (({}.var.db_exec)) -h
                (({origin}.appsetting.service.db.host)) -u
                (({origin}.appsetting.service.db.user))
        'false':
          - call: var
            args:
              key: signature
              value: >-
                MYSQL_PWD=(({origin}.appsetting.service.db.pass))
                (({}.var.db_exec)) -h (({origin}.appsetting.service.db.host)) -u
                (({origin}.appsetting.service.db.user))
    - call: exec
      args:
        message: ''
        cmd: >-
          (({}.var.signature)) -e "SELECT user,host FROM mysql.user;" | tail -n
          +2 | xargs printf "%-25s %s\n"
        out: true
    - event: origin windup
```