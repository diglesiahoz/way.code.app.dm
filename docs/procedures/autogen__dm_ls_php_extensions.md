# dm.ls.php.extensions

📂 `app/custom/app/dm/config/proc/ls.php.extensions.yml`


### Código
```yml
help: Muestra configuración de PHP (extensiones)
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
          (({}.exec)) (({origin}._config_name)) exec php -m | grep -v
          "^[[:space:]]*$"
        out: true
    - event: origin windup
```