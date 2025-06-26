### db.clean

```yml
help: Limpia de tablas la base de datos
example:
- (({}.tmp.proc.sig))
task:
  require:
    config:
      - .*(\.local|\.dev|\.test|\.pre|\.stage) origin
    opt: {}
  do:
    - { event: 'origin startup' }
    -
      call: dm.makeDbClean
      args:
        from_service: (({origin}._parent_key))-db
        base_image: (({origin}.appsetting.service.db.base_image))
        host: (({origin}.appsetting.service.db.host.sv))
        name: (({origin}.appsetting.service.db.name))
        user: (({origin}.appsetting.service.db.user))
        pass: (({origin}.appsetting.service.db.pass))
    - { event: 'origin windup' }
```
[```config/proc/db.clean.yml```](../config/proc/db.clean.yml)
