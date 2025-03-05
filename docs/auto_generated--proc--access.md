### access

```yml
help: Ejecuta comando
example:
- (({}.tmp.proc.sig)) www whoami
- (({}.tmp.proc.sig)) www ls -la
- (({}.tmp.proc.sig)) www vendor/bin/phpstan.phar analyze web/modules/custom --memory-limit=256M
task:
  require:
    config:
      - .*(\.dev|\.test|\.pre|\.prod) origin
    args: {}
    opt:
      user:
        type: String
        default:
    settings: {}
  do:
    - { event: 'origin startup' }
    -
      call: exec
      args:
        user: (({origin}.hook.call[dm.access].exec.user))
        pass: (({origin}.hook.call[dm.access].exec.pass))
        cmd: /bin/bash
        out: true
    - { event: 'origin windup' }
```
[```config/proc/access.yml```](../config/proc/access.yml)
