# dm.db.sync

📂 `app/custom/app/dm/config/proc/db.sync.yml`


### Código
```yml
help: Sincroniza base de datos
example:
  - '(({}.tmp.proc.sig)) --tag drupal10 --lock'
task:
  require:
    config:
      - .*(\.local) origin
    args:
      env_key:
        type: String
        required: true
        default: 'callback::dm.getEnvKeys'
    opt:
      tag:
        type: String
        default: null
      lock:
        type: Boolean
        default: false
  do:
    - event: origin startup
    - call: dm.makeDbSync
      args:
        env_key: '(({}.args.env_key))'
    - event: target windup
```