### service.exec

```yml
help: Ejecuta comando en contenedor
example:
- (({}.tmp.proc.sig)) www whoami
- (({}.tmp.proc.sig)) www ls -la
- (({}.tmp.proc.sig)) www vendor/bin/phpstan.phar analyze web/modules/custom --memory-limit=256M
task:
  require:
    config:
      - .*(\.local) origin
    args:
      service:
        type: String
        required: true
        default: (({origin}.appsetting.service))
      command:
        type: .*
        required: false
        default: /bin/bash
    opt:
      user:
        type: String
        default:
  do:
    - { event: 'origin startup' }
    - 
      check:
        data:
          -
            key: (({}.opt.user))
            is: not equal
            value: ""
        true:
          -
            call: var
            args:
              key: user
              value: (({}.opt.user))
        false:
          -
            call: var
            args:
              key: user
              value: (({}.user.username))
    - 
      check:
        data:
          -
            exec: docker ps --filter name=^/(({origin}.appsetting.tag))-(({}.args.service)) | tail -n +2
            is: not empty
        true:
          -
            call: exec
            args:
              cmd: docker exec -it --user (({}.var.user)) (({origin}.appsetting.tag))-(({}.args.service)) (({}.args.command))
              out: true   
        false:
          -
            call: log
            args:
              message: "Not found service: (({}.args.service))"
              type: warning
    - { event: 'origin windup' }
```
[```config/proc/service.exec.yml```](../config/proc/service.exec.yml)
