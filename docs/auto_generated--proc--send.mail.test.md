### send.mail.test

```yml
help: Envia correo electronico de prueba
example:
- (({}.tmp.proc.sig))
task:
  complete: []
  require:
    config:
      - .*(\.local) origin
    args: {}
    opt: {}
  do:
    - { event: 'origin startup' }
    - { call: exec, args: { cmd: 'docker exec -it (({origin}.appsetting.tag))-www swaks -s (({origin}.appsetting.service.mailhog.host.sv)):1025 --to webmaster@(({origin}.appsetting.wildcard_host))', out: true } }
    - { event: 'origin windup' }
```
[```config/proc/send.mail.test.yml```](../config/proc/send.mail.test.yml)
