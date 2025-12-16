### db.clean

```yml
help: Elimina tablas de base de datos
example:
- (({}.tmp.proc.sig))
task:
  require:
    config:
      - .*(\.local|\.dev|\.test|\.pre|\.stage) origin
    opt: {}
  do:
    - { event: 'origin startup' }
    - call: dm.checkEnv
      args:
        type: exec
        source_env: (({origin}._env))
        source_extra_info: "{(({origin}.appsetting.service.db.host))/(({origin}.appsetting.service.db.name))}"
        target_env: (({origin}._env))
        target_extra_info: "{(({origin}.appsetting.service.db.host))/(({origin}.appsetting.service.db.name))}"
    -
      call: dm.makeDbClean
      args:
        leap_from: (({origin}.appsetting.service.db.leap_from))
        from_service: (({origin}._tag))-db
        base_image: (({origin}.appsetting.service.db.base_image))
        host: (({origin}.appsetting.service.db.host))
        name: (({origin}.appsetting.service.db.name))
        user: (({origin}.appsetting.service.db.user))
        pass: (({origin}.appsetting.service.db.pass))
    - { event: 'origin windup' }
```
[```config/proc/db.clean.yml```](../config/proc/db.clean.yml)
