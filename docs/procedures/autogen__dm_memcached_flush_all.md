# dm.memcached.flush_all

📂 `app/custom/app/dm/config/proc/memcached.flush_all.yml`


### Código
```yml
help: Elimina toda la caché de memcached
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
          memcached flush_all (({}.optAll))\"
        out: true
    - event: origin windup
```