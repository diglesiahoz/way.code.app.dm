### db.access

```yml
help: Acceso a base de datos
example:
- (({}.tmp.proc.sig))
task:
  require:
    config:
      - .*(\.local|\.dev|\.test|\.pre) origin
    args: {}
  do:
    - { event: 'origin startup' }
    -
      call: dm.makeDbConnect
      args:
        is_remote: (({origin}.appsetting.service.db.is_remote))
        base_image: (({origin}.appsetting.service.db.base_image))
        host: (({origin}.appsetting.service.db.host.sv))
        name: (({origin}.appsetting.service.db.name))
        user: (({origin}.appsetting.service.db.user))
        pass: (({origin}.appsetting.service.db.pass))
    - { event: 'origin windup' }
```
[```config/proc/db.access.yml```](../config/proc/db.access.yml)
