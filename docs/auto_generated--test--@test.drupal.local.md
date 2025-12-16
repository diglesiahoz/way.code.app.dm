### @test.drupal.local

```yml
appsetting:
  stack: drupal
  wildcard_host:
    - ((_key))
  path:
    backup_db: ((_root))/private/db
  service:
    db:
      leap_from: {}
      base_image: mariadb:11 # [ mariadb:10.3 | mariadb:11 | mysql:8.0.0 ]
      extra_commands: []
      name: ((_tag))
      user: ((_tag))_user
      pass: ((_tag))_pass
      conf:
        db-export:
          excluded-tables: []
          # excluded-tables: [ "batch", "cache_", "flood", "queue", "search_dataset", "search_index", "search_total", "semaphore", "sessions", "watchdog" ]
    pma:
      base_image: phpmyadmin/phpmyadmin
      extra_commands: []
    mailhog:
      base_image: mailhog/mailhog
      extra_commands: []
    memcached:
      base_image: memcached
      extra_commands: []
    redis:
      base_image: redis:7.2-alpine
      extra_commands: []
    solr:
      base_image: solr
      extra_commands: []
    sonar:
      base_image: sonarqube:community
      extra_commands: []
      user: admin
      pass: Drupal()Sonar1
      token: sqa_70cfb29836d8892c2282baf00cb1f87b91423b79
      project_settings: 
        - sonar.projectVersion=1.0
        - sonar.projectKey=((_key))
        - sonar.projectName=((_key))
        - sonar.host.url=http://((appsetting.service.sonar.host)):9000
        - sonar.projectBaseDir=((appsetting.service.www.drupal.workdir))/web
        - sonar.sources=.
        - sonar.exclusions=../vendor/**,core/vendor/**,sites/default/files/**,node_modules/**
        - sonar.language=php
        - sonar.sourceEncoding=UTF-8
        - sonar.php.coverage.ignoreAnnotations=true
    sonardb:
      base_image: postgres:15
      extra_commands: []
      name: sonar_db
      user: sonar_user
      pass: sonar_pass
    www:
      base_image: ubuntu:24.04
      target: /opt/((_tag))
      extra_commands: []
      webserver: nginx # [ nginx | apache2 ]
      ngrok:
        token: ""
      php:
        release: 8.5
      composer:
        release: 2
      drupal:
        release: ^11
        workdir: ((appsetting.service.www.target))/drupal
        error_level: verbose
        file_system:
          config_path: ../config
          public_path: sites/default/files
          private_path: sites/default/private
          temp_path: /tmp
      curl: http://((_tag))-www
env:
  - APPSETTING_DEV=true
hook:
  args: {}
  call:
    dm.trace:
      dm.makeTrace: 
        to_track:
          nginx.access: 
            type: tail 
            trace: /var/log/nginx/access.log
          nginx.error: 
            type: tail 
            trace: /var/log/nginx/error.log
          drupal.log:
            type: drush
            trace: watchdog:tail --extended
          drupal.error:
            type: drush
            trace: watchdog:tail --severity-min=3 --extended
  event:
    # --------------------------------------------------------
    # - Make Drupal -
    #   way @funely.local make.stack.drupal.basic -fyv
    # --------------------------------------------------------
    dm.make.drupal:
      startup:
        - 
          call: var
          args:
            allow_merge: true
            key: composer.run
            value:
              - require drush/drush
              - require drupal/admin_toolbar
              - require drupal/ckeditor5_plugin_pack
              - require drupal/devel
              - require drupal/environment_indicator
              - require drupal/gin_toolbar
              - require drupal/gin
              - require drupal/memcache
              - require drupal/metatag
              - require drupal/masquerade:^2.0@RC
              - require drupal/paragraphs
              - require drupal/pathauto
              - require drupal/redirect
              - require drupal/redis
              - require drupal/search_api_solr
              - require drupal/symfony_mailer_lite
              - require drupal/twig_tweak
              - require drupal/ultimate_cron:^2.0@beta
              - require drupal/viewsreference:^2.0@beta
        - 
          call: var
          args:
            allow_merge: true
            key: drush.run
            value:
              - pm:enable admin_toolbar
              - pm:enable admin_toolbar_tools
              - pm:enable ckeditor5_plugin_pack
              - pm:enable devel
              - pm:enable environment_indicator
              - pm:enable locale
              - pm:enable masquerade
              - pm:enable memcache
              - pm:enable memcache_admin
              - pm:enable metatag
              - pm:enable paragraphs
              - pm:enable pathauto
              - pm:enable redirect
              - pm:enable redis
              - pm:enable search_api_solr
              - pm:enable symfony_mailer_lite
              - pm:enable twig_tweak
              - pm:enable ultimate_cron
              - pm:enable viewsreference
              - theme:enable gin
              - pm:enable gin_toolbar
              - cset system.theme admin gin
              - cset gin.settings enable_darkmode 0
              - cset gin.settings classic_toolbar horizontal
              - cset system.performance css.preprocess 1
              - cset system.performance js.preprocess 1
              - cset locale.settings translation.import_enabled false -y
              - cset symfony_mailer_lite.settings default_transport smtp -y
              - cset automated_cron.settings interval 0 -y
              - user:create admin.editor --password admin
              - user:role:add content_editor admin.editor
              - pmu search
      windup: {}
```
[```config/@/test/test.drupal.local.yml```](../config/@/test/test.drupal.local.yml)
