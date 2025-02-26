### send.mail.test

```yml
help: Envia email de prueba
example:
- (({}.tmp.proc.sig))
task:
  complete: []
  require:
    config: []
    args: {}
    opt: {}
  do:
    - { event: 'origin startup' }
    -
      call: exec
      args:
        cmd: docker exec -it (({origin}.appsetting.tag))-www swaks -s memora-mailhog:1025
        out: true
    - { event: 'origin windup' }
```
[```config/proc/send.mail.test.yml```](../config/proc/send.mail.test.yml)
