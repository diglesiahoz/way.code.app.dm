### trace.ps

```yml
help: Muestra mensajes de depuración de todos los servicios
example:
- (({}.tmp.proc.sig))
task:
  require:
    config:
      - .*(\.local) origin
  do:
    - { event: 'origin startup' }
    - { call: dm.loadAppSetting }
    - { call: dm.setUp }
    -
      call: exec
      args:
        cd: (({}.var.up_home_root))
        cmd: docker compose logs -f -t
        out: true
    - { event: 'origin windup' }
```
[```config/proc/trace.ps.yml```](../config/proc/trace.ps.yml)
