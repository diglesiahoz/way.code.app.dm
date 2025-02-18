### trace.error

```yml
help: Muestra mensajes de depuración de Nginx
example:
- (({}.tmp.proc.sig))
task:
  require:
    config:
      - .*(\.local) origin
  do:
    -
      call: exec
      args:
        cmd: docker exec -it (({origin}.appsetting.tag))-www tail -f /var/log/(({origin}.appsetting.service.www.webserver))/access.log
        out: true
```
[```config/proc/trace.error.yml```](../config/proc/trace.error.yml)
