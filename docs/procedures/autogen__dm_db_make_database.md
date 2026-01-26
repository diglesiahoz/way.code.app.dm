# dm.db.make.database

📂 `app/custom/app/dm/config/proc/db.make.database.yml`


### Código
```yml
help: Acceso a base de datos
example:
  - '(({}.tmp.proc.sig))'
task:
  require:
    config:
      - .*(\.local|\.dev|\.test|\.pre|\.stage) origin
    args: {}
  do:
    - event: origin startup
    - call: dm.makeDbMakeDatabase
      args:
        from_service: '(({origin}._tag))-db'
        base_image: '(({origin}.appsetting.service.db.base_image))'
        host: '(({origin}.appsetting.service.db.host))'
        name: '(({origin}.appsetting.service.db.name))'
        user: '(({origin}.appsetting.service.db.user))'
        pass: '(({origin}.appsetting.service.db.pass))'
        charset: '(({origin}.appsetting.service.db.charset))'
        collation: '(({origin}.appsetting.service.db.collation))'
    - event: origin windup
```