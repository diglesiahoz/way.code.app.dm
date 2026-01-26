# dm.q.server_access

📂 `app/custom/app/dm/config/proc/q.server_access.yml`


### Código
```yml
help: Get server access
example:
  - '(({}.tmp.proc.sig))'
task:
  require:
    config: []
    args: {}
    settings: {}
  do:
    - event: origin startup
    - call: exec
      args:
        cmd: '(({}.exec)) @*..server.access'
        out: true
    - event: origin windup
```