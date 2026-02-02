---
title: Implementar procedimiento "trace" en perfil
sidebar_label: Implementar procedimiento "trace" en perfil
sidebar_position: 1.0
slug: /custom/apps/dm/recipes/implementar-procedimiento-trace-en-perfil
tags: [recetas]
---

# Implementar procedimiento "trace" en perfil

1. Añade el siguiente código de ejemplo en perfil de configuración.

- Si el perfil no requiere acceso remoto...
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

- Si el perfil requiere acceso remoto...

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