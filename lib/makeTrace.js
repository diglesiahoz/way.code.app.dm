way.lib.dm.makeTrace = async function (_args){
  var _args = way.lib.getArgs('dm.makeTrace', _args);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      (async function() {

        // Carga perfil de configuración
        var envThis = await way.lib.decode({ data: way.env._this }).catch((o) => { return {} });

        // Realiza comprobaciones
        for (const key in _args.to_track) {
          let element = _args.to_track[key];
          if (element.type != 'tail' && element.type != 'exec' && element.type != 'drush') {
            way.lib.exit(`Unsupported type: ${element.type} ("${key}" key from "${envThis._config_name}")`);
          }
          if (element.trace.includes(" ") && element.type == 'tail') {
            way.lib.exit(`Unsupported spaces with "tail" type ("${key}" key from "${envThis._config_name}")`);
          }
          switch (element.type) {
            case "tail":
              _args.to_track[key]['cmd'] = `exec sudo tail -F ${element.trace}`;
              break;
            case "exec":
              _args.to_track[key]['cmd'] = `exec ${element.trace}`;
              break;
            case "drush":
              _args.to_track[key]['cmd'] = `drush ${element.trace}`;
              break;
          }
        }

        // Determina el fichero a trazar
        let trace = _args.type;
        if (way.lib.check(_args.to_track[trace])) {
          trace = _args.to_track[trace];
        } else {
          // Si no se detecta fichero a trazar...
          if (trace != "") {
            way.lib.log({message: `Not found: ${trace}`, type: `warning`});
          }
          // Muestra opciones...
          var choice = await way.lib.complete({
            choices: Object.keys(_args.to_track),
            message: `Select file to track...`
          });
          trace = _args.to_track[choice];
        }

        // Inicializa ejecución
        var exec = {};
        //var exec = Object.assign(exec, _args.access);
        exec['cmd'] = `${way.exec} ${envThis._config_name} ${trace.cmd}`;
        exec['out'] = true;

        // Ejecuta comando
        await way.lib.exec(exec);

        return resolve({
          args: Object.assign({}, _args),
          attach: {},
          code: 0,
          data: {},
        });

      })();
    }, 0); 
  });
}