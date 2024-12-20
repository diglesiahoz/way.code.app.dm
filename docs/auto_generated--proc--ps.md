### ps

```yml
help: Lista servicios
example:
- (({}.tmp.proc.sig))
task:
  require: { }
  do:
    - { event: 'origin startup' }
    - 
      check:
        data:
          -
            key: (({}.args.arg1))
            is: decoded
        true:
          -
            call: exec
            args:
              cmd: docker ps -a --filter name=^/(({}.args.arg1))
              out: true  
        false:
          -
            call: exec
            args:
              cmd: docker ps -a
              out: true  
    - { event: 'origin windup' }
```
[```config/proc/ps.yml```](../config/proc/ps.yml)
