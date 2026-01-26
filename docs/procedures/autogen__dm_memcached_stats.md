# dm.memcached.stats

📂 `app/custom/app/dm/config/proc/memcached.stats.yml`


### Código
```yml
help: Obtiene estadísticas de memcached
example:
  - '(({}.tmp.proc.sig))'
task:
  require:
    config:
      - .*(\.local|\.dev|\.test|\.pre|\.prod) origin
    args: {}
    settings: {}
  do:
    - event: origin startup
    - call: exec
      args:
        cmd: >-
          (({}.exec)) (({origin}._config_name)) dm.exec \"/opt/sh/common.sh
          memcached stats (({}.optAll))\"
        out: true
    - event: origin windup
```