# dm.sonar.scan

📂 `app/custom/app/dm/config/proc/sonar.scan.yml`


### Código
```yml
help: Comparte aplicación a través de Ngrok
example:
  - '(({}.tmp.proc.sig))'
task:
  require:
    config:
      - .*(\.local) origin
    args: {}
  do:
    - event: origin startup
    - call: dm.makeSonarScan
      args:
        user: '(({origin}.appsetting.service.sonar.user))'
        pass: '(({origin}.appsetting.service.sonar.pass))'
        token: '(({origin}.appsetting.service.sonar.token))'
        project_settings: '(({origin}.appsetting.service.sonar.project_settings))'
    - event: origin windup
```