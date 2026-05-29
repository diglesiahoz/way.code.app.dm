# dm.make.drupal.install

📂 `app/custom/app/dm/config/proc/make.drupal.install.yml`


### Código
```yml
help: Instala sitio Drupal (básico)
example:
  - '(({}.tmp.proc.sig))'
task:
  require:
    config:
      - .*(\.local) origin
    args: {}
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
    - call: ask
      args:
        message: ¿Deseas instalar Drupal? (Sobreescribe datos)
        exitIfNegative: true
    - label: Creando proyecto Drupal
      call: exec
      args:
        cd: '(({origin}._root))'
        cmd: >-
          (({}.exec)) dm.composer create
          "drupal/recommended-project:(({origin}.appsetting.service.www.drupal.release))"
    - label: Establece ruta de ficheros
      call: exec
      args:
        cd: '(({origin}._root))'
        cmd: >-
          cp -r drupal/recommended-project/. drupal/ && rm -r
          drupal/recommended-project
    - check:
        data:
          - key: '(({}.var.composer.run))'
            is: Array
        'true':
          - loop: '(({}.var.composer.run))'
            do:
              - label: Ejecutando "(())"
                call: exec
                args:
                  cd: '(({origin}._root))'
                  cmd: '(({}.exec)) dm.composer -n (())'
    - label: Actualiza
      call: exec
      args:
        cd: '(({origin}._root))'
        cmd: '(({}.exec)) dm.composer install'
    - label: Vaciando tablas de base de datos
      call: exec
      args:
        cd: '(({origin}._root))'
        cmd: '(({}.exec)) dm.drush sql-drop -y'
    - label: Generando password de usuario
      call: getRandomString
      args:
        length: 10
        pipe: password
    - label: Instalando Drupal
      call: exec
      args:
        cd: '(({origin}._root))'
        cmd: >-
          (({}.exec)) dm.drush site:install -y --site-name=(({origin}._name))
          --account-name=admin --account-pass=(({}.var.password))
    - check:
        data:
          - key: '(({}.var.drush.run))'
            is: Array
        'true':
          - loop: '(({}.var.drush.run))'
            do:
              - label: Ejecutando "(())"
                call: exec
                args:
                  cd: '(({origin}._root))'
                  cmd: '(({}.exec)) dm.drush -y (())'
    - label: Importando configuración
      call: exec
      args:
        cd: '(({origin}._root))'
        cmd: >-
          (({}.exec)) dm.drush cim --partial
          --source=(({origin}.appsetting.service.www.target))/drupal/config -y
    - label: Exportando configuración
      call: exec
      args:
        cd: '(({origin}._root))'
        cmd: '(({}.exec)) dm.drush cex -y'
    - label: Estableciendo propietario y permisos
      call: exec
      args:
        cmd: 'sudo chown -R $(id -u):www-data (({origin}._root))/drupal'
    - label: Ejecutando cron
      call: exec
      args:
        cd: '(({origin}._root))'
        cmd: '(({}.exec)) dm.drush cron'
        out: true
    - label: Estableciendo proyecto Git
      call: exec
      args:
        cd: '(({origin}._root))'
        cmd: >-
          git init 2>/dev/null && git checkout -b develop && git add . && git
          config user.name 'dummy' && git config user.email 'dummy@dummy.org' &&
          git commit -m "Initial commit" && git config --unset user.name && git
          config --unset user.email
        out: false
    - label: Estableciendo propietario y permisos
      call: exec
      args:
        cmd: 'sudo chmod -R g+w (({origin}._root))/drupal/web/sites/default/files'
    - label: Estableciendo propietario y permisos
      call: exec
      args:
        cmd: 'sudo chmod -R g+w (({origin}._root))/drupal/web/sites/default/private'
    - event: origin windup
```