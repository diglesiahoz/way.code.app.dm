# @dm.test.drupal.headless.local

📂 `app/custom/app/dm/config/@/test/test.drupal.headless.local.yml`


### Código
```yml
_pwd: '(({}.process.env.APPSETTING_PROJECTS_PATH))/((_key))'
appsetting:
  env: ((_env))
  tag: ((_tag))
  key: ((_key))
  root: ((_pwd))
  stack: drupal.headless
  wildcard_host:
    - ((_key))
  path:
    backup_db: ((_pwd))/private/db
  service:
    db:
      leap_from: {}
      base_image: 'mariadb:11'
      extra_commands: []
      host:
        sv: ((_tag))-db
        ui: ''
      name: ((_tag))
      user: ((_tag))_user
      pass: ((_tag))_pass
      conf:
        db-export:
          excluded-tables: []
    pma:
      base_image: phpmyadmin/phpmyadmin
      extra_commands: []
      host:
        sv: ''
        ui: ((_env))-pma.((appsetting.wildcard_host.0))
    mailhog:
      base_image: mailhog/mailhog
      extra_commands: []
      host:
        sv: ((_tag))-mailhog
        ui: ((_env))-mailhog.((appsetting.wildcard_host.0))
    next:
      base_image: 'node:20.9.0'
      extra_commands: []
      host:
        sv: ''
        ui: ((_env)).((appsetting.wildcard_host.0))
      source: ../next
      target: /next
    www:
      base_image: 'ubuntu:24.04'
      extra_commands: []
      host:
        sv: ((_tag))-www
        ui: ((_env))-drupal.((appsetting.wildcard_host.0))
      source: ../
      target: /var/www/html
      webserver: nginx
      webserver_docroot: /((appsetting.stack))/web
      ngrok:
        token: ''
      php:
        release: 8.3
      composer:
        release: 2
      drupal:
        release: ^11
        target: drupal
        error_level: verbose
        file_system:
          config_path: ../config
          public_path: sites/default/files
          private_path: ../private
          temp_path: /tmp
      domain: ((appsetting.service.www.host.ui))
      curl: 'http://((_key))-www'
  env_dockerfile:
    - APPSETTING_DEV=true
hook:
  args: {}
  call: {}
  event:
    dm.make.drupal:
      startup:
        - call: var
          args:
            allow_merge: true
            key: composer.run
            value:
              - config extra.enable-patching true
              - config extra.patches-file composer.patches.json
              - config --no-plugins allow-plugins.cweagans/composer-patches true
              - require cweagans/composer-patches
              - require drush/drush
              - require drupal/admin_toolbar
              - require drupal/devel
              - require drupal/devel_kint_extras
              - require drupal/environment_indicator
              - require drupal/gin_toolbar
              - require drupal/gin
              - require drupal/next
        - call: var
          args:
            allow_merge: true
            key: drush.run
            value:
              - 'pm:enable admin_toolbar'
              - 'pm:enable admin_toolbar_tools'
              - 'pm:enable devel'
              - 'pm:enable devel_kint_extras'
              - 'pm:enable environment_indicator'
              - 'pm:enable next'
              - 'pm:enable next_jsonapi'
              - 'theme:enable gin'
              - 'pm:enable gin_toolbar'
              - config-set system.theme admin gin
              - config-set gin.settings enable_darkmode 0
              - config-set gin.settings classic_toolbar horizontal
      windup: {}
```