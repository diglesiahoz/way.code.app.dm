### Modificar y/o crear certificados

1. Modifica el perfil de configuración
2. Accede al root de la aplicación
```console
cd ~/project/apps/way.code/app/custom/app/dm
make cert && \
way core.init && \
way @dm.test.drupal.local up -v
```
3. Modifica /etc/hosts local
