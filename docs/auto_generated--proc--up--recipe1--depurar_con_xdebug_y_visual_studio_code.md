### Depurar con XDebug y Visual Studio Code

1. Ejemplo de fichero de configuración (launch.json)
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
