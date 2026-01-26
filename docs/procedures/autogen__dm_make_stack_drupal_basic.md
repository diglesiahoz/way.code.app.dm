# dm.make.stack.drupal.basic

📂 `app/custom/app/dm/config/proc/make.stack.drupal.basic.yml`


### Código
```yml
help: Crear nuevo sitio Drupal (básico)
example:
  - '(({}.tmp.proc.sig))'
task:
  require:
    config:
      - .*(\.local) origin
    args:
      command:
        required: false
        type: .*
        default: ''
    opt: {}
    settings:
      appsetting.stack: ^drupal
  do:
    - event: origin startup
    - label: Apagando servicios
      call: exec
      args:
        cmd: '(({}.exec)) (({origin}._config_name)) dm.down (({}.optSig))'
        out: true
    - call: var
      args:
        key: deploy_all_stack
        value: true
    - check:
        data:
          - key: '(({}.opt.f))'
            is: true
        'true':
          - call: exec
            args:
              cmd: '(({}.exec)) (({origin}._config_name)) dm.down 2>/dev/null'
              out: false
          - call: exec
            args:
              cmd: 'docker volume rm "(({origin}._tag))-db_data" 2>/dev/null'
              out: false
          - label: Desplegando configuración
            call: dm.init
            args:
              remove_all: true
              name: '(({origin}.appsetting.stack))'
              include: []
        'false':
          - label: Desplegando configuración
            call: dm.init
            args:
              remove_all: false
              name: '(({origin}.appsetting.stack))'
              include: []
    - label: Levantando servicios
      call: exec
      args:
        cmd: '(({}.exec)) (({origin}._config_name)) dm.up (({}.optSig))'
        out: true
    - call: exec
      args:
        cmd: >-
          (({}.exec)) (({origin}._config_name)) make.drupal.install
          (({}.optSig))
        out: true
    - event: origin windup
```