---
title: Depurar con XDebug y Visual Studio Code
sidebar_label: Depurar con XDebug y Visual Studio Code
sidebar_position: 1.0
slug: /recipes/depurar-con-xdebug-y-visual-studio-code
tags: [core, configuración]
---

# Depurar con XDebug y Visual Studio Code

1. Levantar aplicación

2. Establecer "info.php" en raiz del proyecto (para comprobar que XDebug está activo)
```console
<?php xdebug_info(); ?>
```

3. Instalar extensiones de Visual Studio Code
   - PHP Debug (https://marketplace.visualstudio.com/items?itemName=xdebug.php-debug)

4. Establecer el fichero de configuración "launch.json" en "ROOT_PROYECTO/.vscode/launch.json"
```console
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "XDebug",
      "type": "php",
      "request": "launch",
      "port": 9003,
      "pathMappings": {
        "/var/www/html": "${workspaceFolder}"
      },
      "xdebugSettings": {
        "max_data": 65535,
        "show_hidden": 1,
        "max_children": 100,
        "max_depth": 5
      }
    }
  ]
}
```

5. En Visual Studio Code iniciar depuración