### trace.cron_jobs

```yml
help: Muestra mensajes de trabajos de cron
example:
- (({}.tmp.proc.sig))
task:
  require:
    config:
      - .*(\.local|\.dev|\.test|\.pre|\.stage) origin
  do:
    - { event: 'origin startup' }
    -
      call: exec
      args:
        cmd: (({}.exec)) (({origin}._config_name)) exec tail -F /opt/log/cron_jobs.log
        out: true
    - { event: 'origin windup' }
```
[```config/proc/trace.cron_jobs.yml```](../config/proc/trace.cron_jobs.yml)
