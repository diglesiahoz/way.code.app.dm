### @test.drupal.local

```yml
_pwd: (({}.user.homedir))/project/((._key))
appsetting:
  env: ((._env))
  tag: ((._tag))
  key: ((._key))
  root: ((._pwd))
  stack: drupal-11
  wildcard_host: ((._key))
  path:
    backup_db: ((_pwd))/private/db
  service:
    db:
      base_image: mariadb:11 # [ mariadb:10.3 | mariadb:11 | mysql:8.0.0 ]
      host: ((._tag))-db
      name: ((._tag))
      user: ((._tag))_user
      pass: ((._tag))_pass
      conf:
        db-export:
          excluded-tables:
            - "batch" 
            - "cache_" 
            - "flood" 
            - "queue" 
            - "search_dataset" 
            - "search_index" 
            - "search_total" 
            - "semaphore" 
            - "sessions" 
            - "watchdog"
    pma:
      base_image: phpmyadmin/phpmyadmin
      host: ((_env))-pma.((appsetting.wildcard_host))
    www:
      base_image: ubuntu:24.04
      host: ((_env)).((appsetting.wildcard_host))
      php:
        release: 8.3 # [ 8.1 | 8.3 ]
      drupal:
        release: ^11 # [ ^10 | ^11 ]
      root: drupal
      file_system:
        config_path: sites/default/config
        public_path: sites/default/files
        private_path: ../private
        temp_path: /tmp
      error_level: verbose
hook:
  call: {}
  event:
    dm.make.drupal:
      startup:
        - 
          call: var
          args:
            allow_merge: true
            key: composer.run
            value:
              - require drupal/admin_toolbar
              - require drupal/devel
              - require drupal/devel_kint_extras
              - require drupal/environment_indicator
              - require drupal/metatag
              - require drupal/masquerade:^2.0@RC
              - require drupal/paragraphs
              - require drupal/pathauto
              - require drupal/redirect
              # - require drupal/redis
              - require drupal/twig_tweak
              - require drupal/viewsreference:^2.0@beta
              - require drupal/ckeditor5_plugin_pack
        - 
          call: var
          args:
            allow_merge: true
            key: drush.run
            value:
              - pm:enable admin_toolbar
              - pm:enable admin_toolbar_tools
              - pm:enable devel
              - pm:enable devel_kint_extras
              - pm:enable environment_indicator
              - pm:enable masquerade
              - pm:enable metatag
              - pm:enable paragraphs
              - pm:enable pathauto
              - pm:enable redirect
              # - pm:enable redis
              - pm:enable twig_tweak
              - pm:enable viewsreference
              - pm:enable ckeditor5_plugin_pack
              - config-set system.performance css.preprocess 1
              - config-set system.performance js.preprocess 1
              - user:create admin.editor --password admin
              - user:role:add content_editor admin.editor
              - pm:enable navigation
              - pm:enable navigation_top_bar
      windup: {}
```
[```config/@/test/test.drupal.local.yml```](../config/@/test/test.drupal.local.yml)
