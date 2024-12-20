### drush

```yml
help: Ejecuta drush en contenedor
example:
- (({}.tmp.proc.sig)) st
- (({}.tmp.proc.sig)) cr
- (({}.tmp.proc.sig)) en mymodule
- (({}.tmp.proc.sig)) | grep entity:sync
task:
  complete: [ cr, uli ]
  require:
    config:
      - .*(\.local) origin
    args: {}
  do:
    - { event: 'origin startup' }
    -
      call: var
      args:
        key: alter_arg
        value: ""
    - 
      check:
        data:
          -
            key: (({}.args.arg1))
            is: decoded
        false:
          -
            call: var
            args:
              key: alter_arg
              value: --raw
    - 
      check:
        data:
          -
            key: (({}.args.arg1))
            is: equal
            value: uli
        true:
          -
            call: var
            args:
              key: alter_arg
              value: uli --uri (({origin}.appsetting.service.www.host))
    -
      call: var
      args:
        key: args
        value: (({}.var.alter_arg)) (({}.args._))
    - call: removeDuplicateFromString
      args:
        data: (({}.var.args))
        pipe: args
    -
      call: exec
      args:
        cmd: docker exec --user (({}.user.username)) -it (({origin}.appsetting.tag))-www vendor/bin/drush (({}.var.args))
        out: true       
    - { event: 'origin windup' }
```
[```config/proc/drush.yml```](../config/proc/drush.yml)
