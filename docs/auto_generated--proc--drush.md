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
      - .*(\.local|\.dev|\.test|\.pre|\.stage) origin
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
       cmd: (({}.exec)) (({origin}._config_name)) exec (({origin}.appsetting.service.www.drupal.workdir))/vendor/bin/drush --uri https://(({origin}.appsetting.service.www.domain)) (({}.args.command))
       out: true
    - { event: 'origin windup' }
```
[```config/proc/drush.yml```](../config/proc/drush.yml)
