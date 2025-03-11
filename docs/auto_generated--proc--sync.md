### sync

```yml
help: Sincroniza
example:
- (({}.tmp.proc.sig))
task:
  require:
    config:
      - .*(\.local) origin
    args:
      env_key:
        type: String
        required: true
        default: callback::dm.getEnvKeys
      source_path:
        type: String
        required: false
        default:
      target_path:
        type: String
        required: false
        default: 
    opt:
      dry-run:
        type: Boolean
        default: false
      delete:
        type: Boolean
        default: false
    settings: {}
  do:
    - { event: 'origin startup' }
    -
      call: dm.makeSync
      args:
        env_key: (({}.args.env_key))
        source_path: (({}.args.source_path))
        target_path: (({}.args.target_path))
    - { event: 'origin windup' }
```
[```config/proc/sync.yml```](../config/proc/sync.yml)
