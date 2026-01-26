# dm.make.drupal.reinstall

📂 `app/custom/app/dm/config/proc/make.drupal.reinstall.yml`


### Código
```yml
help: Re-instalar sitio Drupal
example:
  - '(({}.tmp.proc.sig))'
task:
  require:
    config:
      - .*(\.local) origin
    args: {}
    opt: {}
    settings:
      appsetting.stack: ^drupal-11
  do:
    - event: origin startup
    - call: ask
      args:
        message: ¿Deseas re-instalar Drupal? (Sobreescribe datos)
        exitIfNegative: true
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
          (({}.exec)) dm.drush -y site:install --site-name=(({origin}._name))
          --account-name=admin --account-pass=(({}.var.password))
    - label: Eliminando shortcut_set
      call: exec
      args:
        cd: '(({origin}._root))'
        cmd: '(({}.exec)) dm.drush entity:delete shortcut_set'
    - label: Obteniendo UUID del sitio
      call: exec
      args:
        cd: '(({origin}._root))'
        cmd: >-
          (({}.exec)) exec www grep -r "uuid:" ./ | grep config/system.site.yml
          | awk "{ print \$2 }" | xargs
        pipe: site.uuid
        out: false
    - label: Estableciendo UUID del sitio
      call: exec
      args:
        cd: '(({origin}._root))'
        cmd: '(({}.exec)) dm.drush cset system.site uuid (({}.var.site.uuid)) -y'
    - label: Importando configuración
      call: exec
      args:
        cd: '(({origin}._root))'
        cmd: '(({}.exec)) dm.drush cim -y'
    - label: Actualizando base de datos
      call: exec
      args:
        cd: '(({origin}._root))'
        cmd: '(({}.exec)) dm.drush updb -y'
    - label: Actualizando traducciones
      call: exec
      args:
        cd: '(({origin}._root))'
        cmd: '(({}.exec)) dm.drush cr'
    - label: Obteniendo acceso a sitio web
      call: exec
      args:
        cd: '(({origin}._root))'
        cmd: '(({}.exec)) dm.drush uli'
        pipe: access.url
        out: false
    - call: log
      args:
        message: 'URL: (({}.var.access.url))'
        type: success
    - event: origin windup
```