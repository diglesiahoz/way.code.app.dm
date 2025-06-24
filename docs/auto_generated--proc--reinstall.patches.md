### reinstall.patches

```yml
help: Ejecuta comando
example:
- (({}.tmp.proc.sig)) www whoami
- (({}.tmp.proc.sig)) www ls -la
- (({}.tmp.proc.sig)) www vendor/bin/phpstan.phar analyze web/modules/custom --memory-limit=256M
task:
  require:
    config:
      - .*(\.local|\.dev|\.test|\.pre|\.stage) origin
    args:
      command:
        required: true
        type: .*
        default: /bin/bash
    opt:
      user:
        type: String
        default:
    settings: {}
  do:
    - { event: 'origin startup' }
    - 
      check:
        data:
          -
            key: (({origin}._env))
            is: equal
            value: local
        true:
          -
            call: exec
            args:
              cmd: docker exec -it --user (({}.user.username)) (({origin}.appsetting.tag))-www bash -c "composer reinstall \$(jq -r \".extra.patches | keys[]\" composer.json | xargs)"
              out: true
        false:
          - { call: log, args: { message: remote, type: success}}
          -
            call: exec
            args:
              cmd: (({}.exec)) (({origin}._config_name)) exec "cd (({origin}.appsetting.service.www.target)) && composer reinstall \$(jq -r \".extra.patches | keys[]\" (({origin}.appsetting.service.www.target))/composer.json | xargs)"
              out: true
    - { event: 'origin windup' }
```
[```config/proc/reinstall.patches.yml```](../config/proc/reinstall.patches.yml)
