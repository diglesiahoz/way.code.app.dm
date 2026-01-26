# dm.xdebug.down

📂 `app/custom/app/dm/config/proc/xdebug.down.yml`


### Código
```yml
example:
  - '(({}.tmp.proc.sig))'
task:
  require:
    config:
      - .*(\.local) origin
  do:
    - event: origin startup
    - call: exec
      args:
        cmd: >-
          docker exec -it (({origin}.appsetting.service.www.host)) sudo
          phpdismod -s fpm xdebug
        out: true
    - call: exec
      args:
        cmd: >-
          docker exec -it (({origin}.appsetting.service.www.host)) sudo
          phpdismod -s cli xdebug
        out: true
    - call: exec
      args:
        cmd: >-
          docker exec -it (({origin}.appsetting.service.www.host)) sudo service
          php(({origin}.appsetting.service.www.php.release))-fpm reload
        out: false
    - call: exec
      args:
        cmd: >-
          docker exec -it (({origin}.appsetting.service.www.host)) sudo service
          php(({origin}.appsetting.service.www.php.release))-cli reload
        out: false
    - call: log
      args:
        message: Done!
        type: success
    - event: origin windup
```