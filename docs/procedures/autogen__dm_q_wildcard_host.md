# dm.q.wildcard_host

📂 `app/custom/app/dm/config/proc/q.wildcard_host.yml`


### Código
```yml
help: Get local hosts
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
        cmd: >-
          (({}.exec)) @*..appsetting.wildcard_host -o | jq -r "map(to_entries |
          map(.value)) | flatten | join(\" \")" | xargs -n1
        out: true
    - event: origin windup
```