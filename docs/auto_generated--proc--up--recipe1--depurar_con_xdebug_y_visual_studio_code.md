### Depurar con XDebug y Visual Studio Code

1. Instalar extensiones de Visual Studio Code
   - PHP Debug (https://marketplace.visualstudio.com/items?itemName=xdebug.php-debug)
2. Establecer el fichero de configuración (launch.json)
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
3. En Visual Studio Code iniciar depuración
