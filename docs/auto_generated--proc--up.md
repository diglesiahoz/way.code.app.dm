### up

```yml
example:
 - (({}.tmp.proc.sig))
task:
  require:
    config:
      - .*(\.local) origin
    args: {}
    opt:
      keep:
        type: Boolean
        default: false
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
          - { call: exec, args: { cmd: "(({}.exec)) dm.proxy.up (({}.optSig))" }}
    - check:
        data: 
          -
            key: (({origin}.appsetting.stack))
            is: decoded
        true:
          - { call: exec, args: { cmd: "(({}.exec)) (({origin}._config_name)) dm.init (({}.optSig))" }}
    - { call: dm.setUp }
    - { call: exec, args: { cd: "(({}.var.setup_home_root))", cmd: "(({}.var.setup_compose_cmd))", out: true }}
    - { event: 'origin windup' }
```
[```config/proc/up.yml```](../config/proc/up.yml)
