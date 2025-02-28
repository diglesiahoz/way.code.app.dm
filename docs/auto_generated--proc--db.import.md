### db.import

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
    - call: log
      args:
        message: "TODO!"
        type: warning
    - call: exit
```
[```config/proc/db.import.yml```](../config/proc/db.import.yml)
