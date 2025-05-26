### make.stack.drupal.basic

```yml
help: Crear nuevo sitio Drupal (básico)
example:
 - (({}.tmp.proc.sig))
task:
  require:
    config:
      - .*(\.local) origin
    args:
      command:
        required: false
        type: .*
        default: ""
    opt: {}
    settings:
      appsetting.stack: ^drupal
  do:
    - { event: 'origin startup' }
    # Levanta servicios
    -
      label: Apagando servicios
      call: exec
      args:
        cmd: (({}.exec)) (({origin}._config_name)) dm.down (({}.optSig))
        out: true 
    # Despliega stack
    - call: var
      args:
        key: deploy_all_stack
        value: true
    - check:
        data: 
          -
            key: (({}.opt.f))
            is: true
        true:
          - call: exec
            args:
              cmd: (({}.exec)) (({origin}._config_name)) dm.down 2>/dev/null
              out: false
          - call: exec
            args:
              cmd: docker volume rm "(({origin}.appsetting.tag))-db_data" 2>/dev/null
              out: false
          - label: Estableciendo propietario y permisos para "private"
            call: exec
            args:
              cd: (({origin}.appsetting.root))
              cmd: sudo chmod 777 -R (({origin}.appsetting.service.www.drupal.target))
          - label: Desplegando configuración
            call: dm.init
            args:
              remove_all: true
              name: "(({origin}.appsetting.stack))"
              include: []
        false:
          - label: Desplegando configuración
            call: dm.init
            args:
              remove_all: false
              name: "(({origin}.appsetting.stack))"
              include: []
    # Levanta servicios
    -
      label: Levantando servicios
      call: exec
      args:
        cmd: (({}.exec)) (({origin}._config_name)) dm.up (({}.optSig))
        out: true 
    # Instala Drupal
    -
      call: exec
      args:
        cmd: (({}.exec)) (({origin}._config_name)) make.drupal.install (({}.optSig))
        out: true
    # Establece proyecto Git
    - label: Estableciendo proyecto Git
      call: exec
      args:
        cd: (({origin}.appsetting.root))
        cmd: git init 2>/dev/null && git checkout -b develop && git add . && git config user.name 'dummy' && git config user.email 'dummy@dummy.org' && git commit -m "Initial commit" && git config --unset user.name && git config --unset user.email
        out: false
    - { event: 'origin windup' }
```
[```config/proc/make.stack.drupal.basic.yml```](../config/proc/make.stack.drupal.basic.yml)
