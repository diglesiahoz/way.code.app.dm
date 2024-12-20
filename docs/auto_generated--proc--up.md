### up

```yml
help: "Levanta servicios"
example:
 - (({}.tmp.proc.sig))
task:
  require:
    config:
      - .*(\.local) origin
  do:
    - { event: 'origin startup' }
    - 
      check:
        data: 
          -
            key: (({}.env._this._config_name))
            is: not equal
            value: "@dm.proxy.local"
        true:
          - { call: exec, args: { cmd: "(({}.exec)) dm.proxy.up -v" }}
    - { call: dm.loadAppSetting }
    - { call: dm.setUp }
    - check:
        data: 
          -
            key: (({origin}.appsetting.stack))
            is: decoded
        true:
          - { call: exec, args: { cmd: "(({}.exec)) (({origin}._config_name)) dm.init -vf" }}
    -
      call: exec
      args:
        cd: (({}.var.up_home_root))
        cmd: export COMPOSE_PROJECT_NAME=(({origin}._tag)); export APPSETTING_UID=(({}.user.uid)); export APPSETTING_GID=(({}.user.gid)); export APPSETTING_USER=(({}.user.username)); export APPSETTING_ENV=(({origin}._env)); docker compose --env-file .env up -d --build && echo && docker ps --filter name=^/(({origin}.appsetting.tag)) && echo
        out: true
    - { event: 'origin windup' }
```
[```config/proc/up.yml```](../config/proc/up.yml)
