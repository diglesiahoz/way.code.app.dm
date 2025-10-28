### ls.site.headers

```yml
help: Muestra cabeceras
example:
- (({}.tmp.proc.sig))
task:
  require:
    config:
      - .*(\.local|\.dev|\.test|\.pre) origin
  do:
    - { event: 'origin startup' }
    - check:
        data: 
          -
            key: (({origin}._env))
            is: equal
            value: local
        true:
          - { call: exec, args: { cmd: "(({}.exec)) (({origin}._config_name)) exec curl -kIs --http2 http://(({origin}.appsetting.service.www.domain)) 2>/dev/null | sed \"/^[[:space:]]*$/d\"", out: true }}
        false:
          - { call: exec, args: { cmd: "(({}.exec)) (({origin}._config_name)) exec curl -kIs --http2 https://(({origin}.appsetting.service.www.domain)) 2>/dev/null | sed \"/^[[:space:]]*$/d\"", out: true }}
    - { event: 'origin windup' }
```
[```config/proc/ls.site.headers.yml```](../config/proc/ls.site.headers.yml)
