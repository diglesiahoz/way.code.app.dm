# dm.run

📂 `app/custom/app/dm/config/proc/run.yml`


### Código
```yml
help: Ejecuta comandos personalizados
example:
  - '(({}.tmp.proc.sig)) deploy'
task:
  require:
    config:
      - .*(\.local|\.dev|\.test|\.pre|\.stage|\.prod) origin
    args:
      run_name:
        type: String
        required: true
        default: 'callback::dm.getHookEventKeys'
    opt: {}
    settings: {}
  do:
    - event: 'origin (({}.args.run_name))'
```