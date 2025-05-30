### make.drupal.reinstall

```yml
help: Re-instalar sitio Drupal
example:
 - (({}.tmp.proc.sig))
task:
  require:
    config:
      - .*(\.local) origin
    args: {}
    opt: {}
    settings:
      appsetting.stack: ^drupal-11
  do:
    # Lanza evento de inicio
    - event: 'origin startup'
    # Pregunta de control
    - call: ask
      args:
        message: "¿Deseas re-instalar Drupal? (Sobreescribe datos)"
        exitIfNegative: true
    # Genera password de usuario
    - label: Generando password de usuario
      call: getRandomString
      args:
        length: 10
        pipe: password
    # Instala Drupal
    - label: Instalando Drupal
      call: exec
      args:
        cd: (({origin}.appsetting.root))
        cmd: (({}.exec)) dm.drush -y site:install --site-name=(({origin}._name)) --account-name=admin --account-pass=(({}.var.password))
    # Eliminando shortcut
    - label: Eliminando shortcut_set
      call: exec
      args:
        cd: (({origin}.appsetting.root))
        cmd: (({}.exec)) dm.drush entity:delete shortcut_set
    # Obtiene UUID del sitio
    - label: Obteniendo UUID del sitio
      call: exec
      args:
        cd: (({origin}.appsetting.root))
        cmd: (({}.exec)) exec www grep -r "uuid:" ./ | grep config/system.site.yml | awk "{ print \$2 }" | xargs
        pipe: site.uuid
        out: false 
    # Establece UUID del sitio
    - label: Estableciendo UUID del sitio 
      call: exec
      args:
        cd: (({origin}.appsetting.root))
        cmd: (({}.exec)) dm.drush cset system.site uuid (({}.var.site.uuid)) -y
    # Importa configuración
    - label: Importando configuración
      call: exec
      args:
        cd: (({origin}.appsetting.root))
        cmd: (({}.exec)) dm.drush cim -y
    # Actualiza base de datos
    - label: Actualizando base de datos
      call: exec
      args:
        cd: (({origin}.appsetting.root))
        cmd: (({}.exec)) dm.drush updb -y
    ## Comprueba traducciones
    #- label: Comprobando traducciones
    #  call: exec
    #  args:
    #    cd: (({origin}.appsetting.root))
    #    cmd: (({}.exec)) dm.drush locale:check
    ## Actualiza traducciones
    #- label: Actualizando traducciones
    #  call: exec
    #  args:
    #    cd: (({origin}.appsetting.root))
    #    cmd: (({}.exec)) dm.drush locale:update
    # Vaciando la caché
    - label: Actualizando traducciones
      call: exec
      args:
        cd: (({origin}.appsetting.root))
        cmd: (({}.exec)) dm.drush cr
    # Obtiene acceso a sitio web
    - label: Obteniendo acceso a sitio web
      call: exec
      args:
        cd: (({origin}.appsetting.root))
        cmd: (({}.exec)) dm.drush uli
        pipe: access.url
        out: false
    # Mensaje de exito
    - call: log
      args:
        message: "URL: (({}.var.access.url))"
        type: success
    # Lanza evento de fin
    - event: 'origin windup'
```
[```config/proc/make.drupal.reinstall.yml```](../config/proc/make.drupal.reinstall.yml)
