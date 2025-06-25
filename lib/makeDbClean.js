way.lib.dm.makeDbClean = async function (_args){
  var _args = way.lib.getArgs('dm.makeDbClean', _args);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      (async function() {

        // Carga entorno
        var envThis = await way.lib.decode({ data: way.env._this }).catch((o) => { return {} });

        // Determina y establece variables de ejecución
        await way.lib.dm.setDbExec({ base_image: _args.base_image });

        // Establece comando de ejecución en contenedor
        var docker_cmd_source = `docker exec -i --user root -e MYSQL_PWD=${_args.pass} ${_args.from_service}`;
        var db_access = `-h ${_args.host} -u ${_args.user}`

        // Vacia tablas
        if (envThis._env != 'local' && !way.opt.d) {
          if (way.opt.y) {
            way.lib.log({ message: `For safety, excluded option -y`, type: `warning`})
          }
          way.opt.y = false;
        }
        await way.lib.ask({
          message: `Are you sure you want to drop all tables from "${envThis._env}:${_args.host}/${_args.name}"?`,
          exitIfNegative: true
        });
        way.var.tables = '';
        var db_query = `-B -e "use ${_args.name}; show tables"`;
        var docker_exec = `${docker_cmd_source} ${way.var.db_exec} ${db_access} ${db_query} | sed -e "s/^Tables.*//" | xargs -n1`;
        await way.lib.exec({ cmd: `${docker_exec}`, exclude_dryrun: true, pipe: `tables`, out: false });
        var bulk_cmd = [];
        way.var.tables.split('\n').forEach(table_name => {
          if (way.lib.check(table_name)) {
            var db_query = `${_args.name} -e "drop table ${table_name}"`;
            var docker_exec = `${docker_cmd_source} ${way.var.db_exec} ${db_access} ${db_query}`;
            bulk_cmd.push(`${docker_exec}`);
          }
        });
        way.lib.logRunning(`Deleting data from database "${_args.host}/${_args.name}"`);
        for (let key in bulk_cmd) {
          if (Object.hasOwnProperty.call(bulk_cmd, key)) {
            var out = await way.lib.exec({ cmd: `${bulk_cmd[key]}`, out: false });
            if (way.lib.check(out.buffer)) {
              way.lib.log({ message: `${out.buffer}`, type: `error` });
            }
          }
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