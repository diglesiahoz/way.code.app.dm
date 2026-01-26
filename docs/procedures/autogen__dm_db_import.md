# dm.db.import

📂 `app/custom/app/dm/config/proc/db.import.yml`


### Código
```yml
help: Importa base de datos
example:
  - '(({}.tmp.proc.sig)) --last'
  - >-
    (({}.tmp.proc.sig)) --file
    @dm.test.drupal.local---dm_test_drupal---2025-02-25---02:30:00.sql.gz
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
        default: null
  do:
    - event: origin startup
    - call: dm.makeDbImport
      args:
        leap_from: '(({origin}.appsetting.service.db.leap_from))'
        env_key: '(({origin}._config_name))'
        from_service: '(({origin}._tag))-db'
        base_image: '(({origin}.appsetting.service.db.base_image))'
        host: '(({origin}.appsetting.service.db.host))'
        name: '(({origin}.appsetting.service.db.name))'
        user: '(({origin}.appsetting.service.db.user))'
        pass: '(({origin}.appsetting.service.db.pass))'
        backup_db_path: '(({origin}.appsetting.path.backup_db))'
        file: '(({}.opt.file))'
    - event: origin windup
```