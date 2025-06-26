### db.export

```yml
help: Exporta base de datos
example:
- (({}.tmp.proc.sig))
- (({}.tmp.proc.sig)) --tag test
- (({}.tmp.proc.sig)) --lock-tables
task:
  require:
    config:
      - .*(\.local|\.dev|\.test|\.pre|\.stage|\.prod) origin
    opt:
      tag:
        type: String
        default:
      lock:
        type: Boolean
        default: false
  do: 
    - { event: 'origin startup' }
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
    - { event: 'origin windup' }
```
[```config/proc/db.export.yml```](../config/proc/db.export.yml)
