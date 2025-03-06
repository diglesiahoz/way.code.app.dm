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
    args:
      command:
        required: false
        type: .*
        default: ""
  do:
    - { event: 'origin startup' }
    -
      call: exec
      args:
        cmd: docker exec --user (({}.user.username)) -it (({origin}.appsetting.tag))-www vendor/bin/drush (({}.args.command))
        out: true
    - { event: 'origin windup' }
```
[```config/proc/drush.yml```](../config/proc/drush.yml)
