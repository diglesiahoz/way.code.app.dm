### db.sync

```yml
help: Sincroniza base de datos
example:
- (({}.tmp.proc.sig))
- (({}.tmp.proc.sig)) --lock --drop
task:
  require:
    config:
      - .*(\.local|\.dev|\.test|\.pre|\.stage|\.prod) origin
      - .*(\.local|\.dev|\.test|\.pre|\.stage) target
    args: {}
    opt:
      tag:
        type: String
        default:
      lock:
        type: Boolean
        default: false
      drop:
        type: Boolean
        default: false
  do:
    - { event: 'origin startup' }
    - { event: 'target startup' }
    - { call: 'dm.checkEnvDbSync' }
    -
      call: dm.makeDbExport
      args:
        from_service: (({origin}._parent_key))-db
        base_image: (({origin}.appsetting.service.db.base_image))
        host: (({origin}.appsetting.service.db.host.sv))
        name: (({origin}.appsetting.service.db.name))
        user: (({origin}.appsetting.service.db.user))
        pass: (({origin}.appsetting.service.db.pass))
        excluded_tables: (({origin}.appsetting.service.db.conf.db-export.excluded-tables))
        backup_db_path: (({origin}.appsetting.path.backup_db))
    -
      call: dm.makeDbImport
      args:
        from_service: (({target}._parent_key))-db
        base_image: (({target}.appsetting.service.db.base_image))
        host: (({target}.appsetting.service.db.host.sv))
        name: (({target}.appsetting.service.db.name))
        user: (({target}.appsetting.service.db.user))
        pass: (({target}.appsetting.service.db.pass))
        backup_db_path: (({target}.appsetting.path.backup_db))
        file: (({}.out.data.file))
    - { event: 'origin windup' }
    - { event: 'target startup' }
```
[```config/proc/db.sync.yml```](../config/proc/db.sync.yml)
