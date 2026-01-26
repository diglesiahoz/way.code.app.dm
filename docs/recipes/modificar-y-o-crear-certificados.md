---
title: Modificar y/o crear certificados
sidebar_label: Modificar y/o crear certificados
sidebar_position: 1.0
slug: /recipes/modificar-y-o-crear-certificados
tags: [core, configuración]
---

# Modificar y/o crear certificados

:::warning
- Necesario instalar "jq" y "mkcert" en tu host
:::

1. Modifica el perfil de configuración

2. Accede al root de la aplicación
```console
cd ~/project/apps/way.code/app/custom/app/dm
make cert && \
way core.init && \
way @dm.test.drupal.local up -v
```

3. Modifica /etc/hosts local