### ls.network

```yml
help: Lista redes
example:
- (({}.tmp.proc.sig))
- (({}.tmp.proc.sig)) --all
task:
  require:
    config:
      - .*(\.local) origin
    opt: {}
  do:
    - { event: 'origin startup' }
    - { call: dm.getNetworks }
    #-
    #  call: exec
    #  args:
    #    cmd: docker network ls | awk "{ print \$2 }" | tail -n +2 | xargs printf "%-50s %s\n"
    #    out: false
    #    cast: true
    #    pipe: networks
    #-
    #  loop: (({}.var.networks))
    #  do:
    #    -
    #      call: exec
    #      args:
    #        cmd: docker network inspect (())
    #        out: true
    - { event: 'origin windup' }
```
[```config/proc/ls.network.yml```](../config/proc/ls.network.yml)
