way.lib.dm.makeDbClean = async function (_args){
  var _args = way.lib.getArgs('dm.makeDbClean', _args);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      (async function() {

        // Carga entorno
        var envThis = await way.lib.decode({ data: way.env._this }).catch((o) => { return {} });

        // Determina y establece variables de ejecución
        await way.lib.dm.setDbExec({ base_image: _args.base_image });

        // Inicializa ejecución
        var exec = {};

        // Establece acceso a base de datos
        if (way.lib.check(_args.leap_from)) {
          var exec = Object.assign(exec, _args.leap_from);
          var db_signature = `MYSQL_PWD=${_args.pass} ${way.var.db_exec} -h ${_args.host} -u ${_args.user}`;
        } else {
          var db_signature = `docker exec -i --user root -e MYSQL_PWD=${_args.pass} ${_args.from_service} ${way.var.db_exec} -h ${_args.host} -u ${_args.user}`;
        }

        // Monta comando para obtener tablas
        exec['cmd'] = `${db_signature} -B -e "USE ${_args.name}; SHOW TABLES" | sed "1d" | paste -sd "," -`;
        exec['exclude_dryrun'] = true;
        exec['pipe'] = 'tables';
        exec['out'] = false;

        // Obtiene tablas
        way.var.tables = '';
        way.lib.logRunning(`Getting database tables from "${envThis._env}:${_args.host}/${_args.name}"`);
        var out = await way.lib.exec(exec);
        way.lib.clearLogRunning();

        // Si encuentra tablas...
        if (way.lib.check(way.var.tables)) {

          // Por seguridad...
          if (way.opt.y && !way.opt.d) {
            // Si el entorno es local excluye comprobación
            if (envThis._env != 'local') {
              way.lib.log({ message: `Excluded option -y`, type: `warning`});
              way.opt.y = false;
            }
          }

          // Pregunta de control
          await way.lib.ask({
            message: `Are you sure you want to drop all tables from "${envThis._env}:${_args.host}/${_args.name}"?`,
            exitIfNegative: true
          });

          // Monta comando para eliminar tablas
          exec['cmd'] = `${db_signature} -B -e "USE ${_args.name}; DROP TABLE IF EXISTS ${way.var.tables}"`;
          exec['exclude_dryrun'] = false;
          exec['pipe'] = 'tables';
          exec['out'] = false;

          // Elimina tablas
          way.lib.logRunning(`Dropping database tables from "${envThis._env}:${_args.host}/${_args.name}"`);
          var out = await way.lib.exec(exec);
          way.lib.clearLogRunning();

          // Muestra mensajes tras la ejecución
          if (way.lib.check(out.buffer)) {
            way.lib.log({ message: `${out.buffer}`, type: `error` });
          } else {
            way.lib.log({ message: `Dropped database tables into "${envThis._env}:${_args.host}/${_args.name}"`, type: `success` });
          }

        // Si no encuentra tablas...
        } else {
          way.lib.log({ message: `Not found tables from "${envThis._env}:${_args.host}/${_args.name}"`, type: `label` });
        }

        // Devuelve información
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