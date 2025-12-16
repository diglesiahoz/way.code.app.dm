### q.server_access

```yml
help: Get server access
example:
- (({}.tmp.proc.sig))
task:
  require:
    config: []
    args: {}
    settings: {}
  do:
    - { event: 'origin startup' }
    -
      call: exec
      args:
        cmd: (({}.exec)) @*..server.access
        out: true
    - { event: 'origin windup' }
```
[```config/proc/q.server_access.yml```](../config/proc/q.server_access.yml)
