### make.drupal.install

```yml
help: Instala sitio Drupal (básico)
example:
 - (({}.tmp.proc.sig))
task:
  require:
    config:
      - .*(\.local) origin
    args: {}
    opt: {}
    settings:
      appsetting.stack: ^drupal
  do:
    # Lanza evento de inicio
    - event: 'origin startup'
    # Pregunta de control
    - call: ask
      args:
        message: "¿Deseas instalar Drupal? (Sobreescribe datos)"
        exitIfNegative: true
    # Crea proyecto Drupal mediante Composer
    - label: Creando proyecto Drupal
      call: exec
      args:
        cd: (({origin}.appsetting.root))
        cmd: (({}.exec)) dm.composer create "drupal/recommended-project:(({origin}.appsetting.service.www.drupal.release))"
    # Establece ruta de ficheros
    - label: Establece ruta de ficheros
      call: exec
      args:
        cd: (({origin}.appsetting.root))
        cmd: cp -r drupal/recommended-project/. drupal/ && rm -r drupal/recommended-project
    # Establece dependencias
    - check:
        data: 
          -
            key: (({}.var.composer.run))
            is: Array
        true:
          - 
            loop: (({}.var.composer.run))
            do:
              - 
                label: Ejecutando "(())"
                call: exec
                args:
                  cd: (({origin}.appsetting.root))
                  cmd: (({}.exec)) dm.composer -n (()) 
    # Actualiza dependencias
    - label: Actualiza
      call: exec
      args:
        cd: (({origin}.appsetting.root))
        cmd: (({}.exec)) dm.composer install
    # Vacia base de datos
    - label: Vaciando tablas de base de datos
      call: exec
      args:
        cd: (({origin}.appsetting.root))
        cmd: (({}.exec)) dm.drush sql-drop -y
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
        cmd: (({}.exec)) dm.drush site:install -y --site-name=(({origin}._name)) --account-name=admin --account-pass=(({}.var.password))
    # Configura Drupal
    - check:
        data: 
          -
            key: (({}.var.drush.run))
            is: Array
        true:
          - 
            loop: (({}.var.drush.run))
            do:
              - 
                label: Ejecutando "(())"
                call: exec
                args:
                  cd: (({origin}.appsetting.root))
                  cmd: (({}.exec)) dm.drush -y (())
    # Importa configuración (Necesario para aplicar cambios desde plantillas)
    - label: Importando configuración
      call: exec
      args:
        cd: (({origin}.appsetting.root))
        cmd: (({}.exec)) dm.drush cim --partial --source=(({origin}.appsetting.service.www.target))/drupal/config -y
    # Exporta configuración
    - label: Exportando configuración
      call: exec
      args:
        cd: (({origin}.appsetting.root))
        cmd: (({}.exec)) dm.drush cex -y
    # Establece propietario
    - label: Estableciendo propietario y permisos
      call: exec
      args:
        cd: 
        cmd: sudo chown -R $(id -u):www-data (({origin}.appsetting.root))/drupal
    # Ejecuta cron
    - label: Ejecutando cron
      call: exec
      args:
        cd: (({origin}.appsetting.root))
        cmd: (({}.exec)) dm.drush cron
        out: true
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
[```config/proc/make.drupal.install.yml```](../config/proc/make.drupal.install.yml)
