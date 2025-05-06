### trace.cron

```yml
help: Muestra mensajes de depuración de Nginx
example:
- (({}.tmp.proc.sig))
task:
  require:
    config:
      - .*(\.local|\.dev|\.test|\.pre) origin
  do:
    - { event: 'origin startup' }
    -
      call: exec
      args:
        cmd: (({}.exec)) (({origin}._config_name)) exec tail -f /var/log/cron_jobs.log
        out: true
    - { event: 'origin windup' }
```
[```config/proc/trace.cron.yml```](../config/proc/trace.cron.yml)
