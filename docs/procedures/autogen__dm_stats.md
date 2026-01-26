# dm.stats

📂 `app/custom/app/dm/config/proc/stats.yml`


### Código
```yml
help: Muestra estadísticas de uso
example:
  - '(({}.tmp.proc.sig))'
task:
  require:
    config: []
    args: {}
  do:
    - event: origin startup
    - call: exec
      args:
        cmd: docker stats
        out: true
    - event: origin windup
```