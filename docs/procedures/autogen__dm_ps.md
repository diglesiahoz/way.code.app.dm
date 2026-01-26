# dm.ps

📂 `app/custom/app/dm/config/proc/ps.yml`


### Código
```yml
help: Lista servicios
example:
  - '(({}.tmp.proc.sig))'
task:
  require:
    config: []
    args:
      filter:
        required: false
        type: String
        default: null
  do:
    - event: origin startup
    - check:
        data:
          - key: '(({}.args.filter))'
            is: decoded
        'true':
          - call: exec
            args:
              cmd: 'docker ps --filter name=^/(({}.args.filter))'
              out: true
        'false':
          - call: exec
            args:
              cmd: docker ps -a
              out: true
    - event: origin windup
```