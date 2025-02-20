### ls.php.extensions

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
        cmd: docker exec -it --user root (({origin}.appsetting.tag))-www php -m
        out: true  
    # Lanza evento "windup"
    - 
      event: windup
```
[```config/proc/ls.php.extensions.yml```](../config/proc/ls.php.extensions.yml)
