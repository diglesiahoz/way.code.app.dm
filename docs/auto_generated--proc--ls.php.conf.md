### ls.php.conf

```yml
help: Muestra configuración de PHP
example:
- (({}.tmp.proc.sig))
task:
  require:
    config:
      - .*(\.local) origin
  do:
    # Lanza evento "startup"
    - 
      event: startup
    -
      call: exec
      args:
        cmd: docker exec -it --user root (({origin}.appsetting.tag))-www cat /etc/php/(({origin}.appsetting.service.www.php.release))/fpm/php.ini | grep -v "^;" | grep -v "^\[" | grep -v "^[[:space:]]*$" | sort
        out: true  
    # Lanza evento "windup"
    - 
      event: windup
```
[```config/proc/ls.php.conf.yml```](../config/proc/ls.php.conf.yml)
