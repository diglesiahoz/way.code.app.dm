### down

```yml
help: Apaga servicios
example:
- (({}.tmp.proc.sig))
task:
  require:
    config:
      - .*(\.local) origin
  do:
    - { event: 'origin startup' }
    - { call: dm.loadAppSetting }
    - { call: dm.setUp }
    -
      call: exec
      args:
        cd: (({}.var.setup_home_root))
        cmd: export COMPOSE_PROJECT_NAME=(({origin}._tag)); export APPSETTING_UID=(({}.user.uid)); export APPSETTING_GID=(({}.user.gid)); export APPSETTING_USER=(({}.user.username)); export APPSETTING_ENV=(({origin}._env)); docker compose --env-file .env down
        out: true
    - { event: 'origin windup' }
```
[```config/proc/down.yml```](../config/proc/down.yml)
