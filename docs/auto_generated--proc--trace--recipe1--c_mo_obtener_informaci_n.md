### Cómo obtener información

1. Añade el siguiente código de ejemplo en perfil de configuración.
1.1 Si el perfil no requiere acceso remoto...
```console
hook:
  call:
    dm.trace:
      dm.makeTrace: 
        to_track:
          apache2/access: 
            type: tail 
            trace: /var/log/apache2/access.log
          apache2/error: 
            type: tail 
            trace: /var/log/apache2/error.log
          purchase: 
            type: drush 
            trace: sibs:report:purchase --limit 10
```
1.2 Si el perfil requiere acceso remoto...
```console
hook:
  call:
     dm.exec:
       exec:
           user: MY_USER
           pass: MY_PASS
           host: MY_IP
    dm.trace:
      dm.makeTrace: 
        to_track:
          apache2/access: 
            type: tail 
            trace: /var/log/apache2/access.log
          apache2/error: 
            type: tail 
            trace: /var/log/apache2/error.log
          purchase: 
            type: drush 
            trace: sibs:report:purchase --limit 10
```
2. Ejecuta procedimiento
