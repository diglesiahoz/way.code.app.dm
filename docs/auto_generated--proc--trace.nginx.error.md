### trace.nginx.error

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
        cmd: docker exec -it (({origin}.appsetting.tag))-www tail -f /var/log/nginx/error.log
        out: true
```
[```config/proc/trace.nginx.error.yml```](../config/proc/trace.nginx.error.yml)
