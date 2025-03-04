### db.access

```yml
help: Acceso a base de datos
example:
- (({}.tmp.proc.sig))
task:
  require:
    config:
      - .*(\.local|\.dev|\.test|\.pre|\.prod) origin
    args: {}
  do:
    - { event: 'origin startup' }
    -
      call: dm.makeDbAccess
      args:
        from_service: (({origin}._tag))-db
        base_image: (({origin}.appsetting.service.db.base_image))
        host: (({origin}.appsetting.service.db.host.sv))
        name: (({origin}.appsetting.service.db.name))
        user: (({origin}.appsetting.service.db.user))
        pass: (({origin}.appsetting.service.db.pass))
    - { event: 'origin windup' }
```
[```config/proc/db.access.yml```](../config/proc/db.access.yml)
