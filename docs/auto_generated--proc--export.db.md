### export.db

```yml
help: Exporta base de datos
example:
- (({}.tmp.proc.sig))
task:
  require:
    config:
      - .*(\.local) origin
    opt:
      tag:
        type: String
        default:
  do: 
    - { event: 'origin startup' }
    -
      call: dm.setExecDbService
      args:
        base_image: (({origin}.appsetting.service.db.base_image))
    - 
      call: getTagFromString
      args:
        data: (({}.opt.tag))
        pipe: tag
    - 
      check:
        data:
          -
            key: (({}.var.tag))
            is: not equal
            value: ""
        true:
          -
            call: var
            args:
              key: tag
              value: ---(({}.var.tag))
    -
      label: Excluyendo tablas
      call: exec
      args:
        cmd: docker exec -i (({origin}.appsetting.tag))-db (({}.var.service_db_exec)) -B -e "use (({origin}.appsetting.service.db.name)); show tables" | sed -e "s/^Tables.*//" | xargs -n1
        pipe: tables
    -
      loop: (({origin}.appsetting.service.db.conf.db-export.excluded-tables))
      do:
        -
          call: exec
          args:
            cmd: echo "(({}.var.tables))" | grep ^(()) | awk "{ print \"--ignore-table=(({origin}.appsetting.service.db.name)).\"\$1 }" | xargs
            pipe: signature
        -
          call: eval
          args:
            cmd: process.env.OUT=`${process.env.OUT} (({}.var.signature))`
    -
      call: exec
      args:
        cmd: echo $OUT | sed -e "s/^undefined//" | xargs
        pipe: excluded.tables
    -
      call: getDate
      args:
        pipe: date
    -
      call: var
      args:
        key: target.database
        value: (({origin}.appsetting.path.backup_db))/(({origin}._config_name))---(({origin}.appsetting.service.db.name))---(({}.var.date))(({}.var.tag)).sql
    -
      label: Exportando base de datos
      call: exec
      args:
        cmd: docker exec (({origin}.appsetting.tag))-db (({}.var.service_db_exec_dump)) --quick --max_allowed_packet=512M (({origin}.appsetting.service.db.name)) (({}.var.excluded.tables)) | gzip > (({}.var.target.database)).gz
        out: true
    -
      call: log
      args:
        message: Base de datos exportada en fichero (({}.var.target.database)).gz
        type: success
    - { event: 'origin windup' }
```
[```config/proc/export.db.yml```](../config/proc/export.db.yml)
