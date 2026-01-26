# dm.ls.php.fpm.pool

📂 `app/custom/app/dm/config/proc/ls.php.fpm.pool.yml`


### Código
```yml
help: Muestra configuración de PHP (fpm pool)
example:
  - '(({}.tmp.proc.sig))'
task:
  require:
    config:
      - .*(\.local|\.dev|\.test|\.pre) origin
  do:
    - event: origin startup
    - call: exec
      args:
        cmd: >-
          (({}.exec)) (({origin}._config_name)) exec cat
          /etc/php/(({origin}.appsetting.service.www.php.release))/fpm/pool.d/www.conf
          | grep -Ev "^;" | grep -v "^[[:space:]]*$"
        out: true
    - event: origin windup
```