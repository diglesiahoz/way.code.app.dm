### make.drupal

```yml
help: Crear nuevo sitio Drupal
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
    # Establece variable que permite desplegar todo el "stack"
    - call: var
      args:
        key: deploy_all_stack
        value: true
    # Pregunta de control
    - call: ask
      args:
        message: "¿Deseas instalar Drupal? (Sobreescribe datos)"
        exitIfNegative: true
    # Inicializa código
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
    # Establece directorios de destino drupal
    - loop:
        - (({origin}.appsetting.root))/(({origin}.appsetting.service.www.drupal.target))/recommended-project
      do:
        - label: Creando directorio (())
          call: exec
          args:
            cmd: mkdir -p (())
    # Reinicia servicios
    - label: Levantando servicios
      call: exec
      args:
        cd: (({origin}.appsetting.root))
        cmd: (({}.exec)) dm.restart
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
        cmd: cp -r (({origin}.appsetting.service.www.drupal.target))/recommended-project/. (({origin}.appsetting.service.www.drupal.target))/ && rm -r (({origin}.appsetting.service.www.drupal.target))/recommended-project
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
    # Despliega estrutura de pila
    - label: Desplegando código
      call: dm.init
      args:
        remove_all: false
        name: "(({origin}.appsetting.stack))"
        include:
          - '^drupal/'
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
        cmd: (({}.exec)) dm.drush cim --partial --source=/var/www/html/config -y
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
        cd: (({origin}.appsetting.root))
        # cmd: chown -R $(id -u):$(id -g) (({origin}.appsetting.service.www.drupal.target))/
        cmd: sudo chown -R $(id -u):www-data (({origin}.appsetting.service.www.drupal.target))/web
    # Establece permisos
    - label: Estableciendo propietario y permisos para "web"
      call: exec
      args:
        cd: (({origin}.appsetting.root))
        cmd: sudo chmod -R g+w (({origin}.appsetting.service.www.drupal.target))/web
    - label: Estableciendo propietario y permisos para "private"
      call: exec
      args:
        cd: (({origin}.appsetting.root))
        cmd: sudo chmod 777 (({origin}.appsetting.service.www.drupal.target))/private
    - label: Estableciendo propietario y permisos para "private"
      call: exec
      args:
        cd: (({origin}.appsetting.root))
        cmd: sudo chmod 777 (({origin}.appsetting.service.www.drupal.target))/private
    # Establece proyecto Git
    - label: Estableciendo proyecto Git
      call: exec
      args:
        cd: (({origin}.appsetting.root))
        cmd: git init 2>/dev/null && git checkout -b develop && git add . && git config user.name 'dummy' && git config user.email 'dummy@dummy.org' && git commit -m "Initial commit" && git config --unset user.name && git config --unset user.email
        out: false
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
[```config/proc/make.drupal.yml```](../config/proc/make.drupal.yml)
