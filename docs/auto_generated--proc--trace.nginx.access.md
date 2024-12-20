### trace.nginx.access

```yml
help: Muestra mensajes de depuración de Nginx
example:
- (({}.tmp.proc.sig))
task:
  require:
    config:
      - .*(\.local) origin
  do:
    - { event: 'origin startup' }
    -
      call: exec
      args:
        cmd: docker exec -it (({origin}.appsetting.tag))-www tail -f /var/log/nginx/access.log
        out: true
    - { event: 'origin windup' }
```
[```config/proc/trace.nginx.access.yml```](../config/proc/trace.nginx.access.yml)
