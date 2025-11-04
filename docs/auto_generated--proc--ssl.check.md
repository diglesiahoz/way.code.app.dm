### ssl.check

```yml
help: Realiza comprobación de certificado
example:
- (({}.tmp.proc.sig))
task:
  complete: []
  require:
    config:
      - .*(\.local|\.dev|\.test|\.pre|\.stage|\.prod) origin
    args: {}
    opt: {}
  do:
    - { event: 'origin startup' }
    - { call: exec, args: { cmd: "echo | openssl s_client -connect (({origin}.appsetting.service.www.host.ui)):443 -servername (({origin}.appsetting.service.www.host.ui)) 2>/dev/null | openssl x509 -noout -text | grep -A1 \"Subject Alternative Name\" | xargs", out: true } }
    - { event: 'origin windup' }
```
[```config/proc/ssl.check.yml```](../config/proc/ssl.check.yml)
