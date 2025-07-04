### db.import

```yml
help: Importa base de datos
example:
- (({}.tmp.proc.sig))
- (({}.tmp.proc.sig)) --last --truncate
- (({}.tmp.proc.sig)) --truncate --file @dm.test.drupal.local---dm_test_drupal---2025-02-25---02:30:00.sql.gz
task:
  require:
    config:
      - .*(\.local|\.dev|\.test|\.pre|\.stage) origin
    opt:
      last:
        type: Boolean
        default: false
      file:
        type: String
        default: 
      drop:
        type: Boolean
        default: false
  do:
    - { event: 'origin startup' }
    -
      call: dm.makeDbImport
      args:
        from_service: (({origin}._parent_key))-db
        base_image: (({origin}.appsetting.service.db.base_image))
        host: (({origin}.appsetting.service.db.host.sv))
        name: (({origin}.appsetting.service.db.name))
        user: (({origin}.appsetting.service.db.user))
        pass: (({origin}.appsetting.service.db.pass))
        backup_db_path: (({origin}.appsetting.path.backup_db))
        file: (({}.opt.file))
    - { event: 'origin windup' }
```
[```config/proc/db.import.yml```](../config/proc/db.import.yml)
