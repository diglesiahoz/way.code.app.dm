### import.db

```yml
help: Importa base de datos
example:
- (({}.tmp.proc.sig))
- (({}.tmp.proc.sig)) --last --force
task:
  require:
    config:
      - .*(\.local) origin
    opt:
      last:
        type: Boolean
        default: false
      force:
        type: Boolean
        default: false
  do:
    - { event: 'origin startup' }
    # Establece el ejecutable a partir de la imagen
    -
      call: dm.setExecDbService
      args:
        base_image: (({origin}.appsetting.service.db.base_image))
    # Comprueba si está establecida opción "--last"
    - 
      check:
        data:
          -
            key: (({}.opt.last))
            is: equal
            value: true
        # Obtiene última base de datos
        true:
          -
            call: exec
            args:
              cmd: find (({origin}.appsetting.path.backup_db)) -name "*.sql*" -printf "%T+ %p\n" | sort -nr | awk -F/ "{ print \$NF }" | head -1
              pipe: filename
        # Obtiene todos los ficheros de base de datos
        false:
          -
            call: exec
            args:
              cmd: find (({origin}.appsetting.path.backup_db)) -name "*.sql*" -printf "%T+ %p\n" | sort -nr | awk -F/ "{ print \$NF }"
              cast: true
              pipe: databases
          -
            call: complete
            args:
              choices: (({}.var.databases))
              pipe: filename
    # Comprueba que hay bases de datos para importar
    - 
      check:
        data:
          -
            key: (({}.var.filename))
            is: decoded
        false:
          - 
            call: log
            args:
              message: "No se han encontrado bases de datos (.sql|.sql.gz) para importar ficheros desde \"(({origin}.appsetting.path.backup_db))\"" 
              type: warning
          - 
            call: exit
    # Vacia tablas de la base de datos si detecta opción "--force"
    - 
      check:
        data:
          -
            key: (({}.opt.force))
            is: equal
            value: true
        true:
          -
            label: "Obteniendo tablas de base de datos: (({origin}.appsetting.service.db.name))"
            call: exec
            args:
              cmd: docker exec -i (({origin}.appsetting.tag))-db (({}.var.service_db_exec)) -B -e "use (({origin}.appsetting.service.db.name)); show tables" | sed -e "s/^Tables.*//" | xargs -n1
              out: false
              cast: true
              pipe: tables
          -
            loop: (({}.var.tables))
            do:
              -
                label: "Vaciando tabla: (({origin}.appsetting.service.db.name)).(())"
                call: exec
                args:
                  cmd: docker exec -i (({origin}.appsetting.tag))-db (({}.var.service_db_exec)) -e "truncate table (())" (({origin}.appsetting.service.db.name))
                  out: false
    # Comprueba el tipo de fichero
    - 
      check:
        data:
          -
            key: (({}.var.filename))
            is: RegExp
            value: "gz$"
        true:
          # Importa base de datos
          -
            label: "Descomprimiendo base de datos"
            call: exec
            args:
              cmd: gzip -c -d (({origin}.appsetting.path.backup_db))/(({}.var.filename)) > (({origin}.appsetting.path.backup_db))/(({}.var.filename)).sql
              out: true
          # Importa base de datos
          -
            label: "Importando base de datos"
            call: exec
            args:
              cmd: docker exec -i (({origin}.appsetting.tag))-db (({}.var.service_db_exec)) --one-database (({origin}.appsetting.service.db.name)) < (({origin}.appsetting.path.backup_db))/(({}.var.filename)).sql
              out: true
          # Elimina base de datos
          -
            label: "Eliminando fichero .sql"
            call: exec
            args:
              cmd: rm (({origin}.appsetting.path.backup_db))/(({}.var.filename)).sql
              out: true
        false:
          # Importa base de datos
          -
            label: "Importando base de datos"
            call: exec
            args:
              cmd: docker exec -i (({origin}.appsetting.tag))-db (({}.var.service_db_exec)) --one-database (({origin}.appsetting.service.db.name)) < (({origin}.appsetting.path.backup_db))/(({}.var.filename))
              out: true
          # Elimina base de datos
          -
            label: "Eliminando fichero .sql"
            call: exec
            args:
              cmd: rm (({origin}.appsetting.path.backup_db))/(({}.var.filename))
              out: true
    -
      call: log
      args:
        message: Base de datos importada
        type: success
    - { event: 'origin windup' }
```
[```config/proc/import.db.yml```](../config/proc/import.db.yml)
