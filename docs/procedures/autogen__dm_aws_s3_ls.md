# dm.aws.s3.ls

📂 `app/custom/app/dm/config/proc/aws/s3.ls.yml`


### Código
```yml
task:
  complete: []
  require:
    config:
      - .*(\.local) origin
    args: {}
    opt: {}
    setttings: {}
  do:
    - event: origin startup
    - call: exec
      args:
        cmd: >
          docker exec -e
          AWS_ACCESS_KEY_ID="(({origin}.appsetting.aws.access_key))" -e
          AWS_SECRET_ACCESS_KEY="(({origin}.appsetting.aws.secret_key))" -e
          AWS_DEFAULT_REGION="(({origin}.appsetting.aws.region))" -it
          (({origin}.appsetting.service.www.host)) aws s3 ls
          s3://(({origin}.appsetting.aws.bucket)) --recursive
        out: true
    - event: origin windup
```