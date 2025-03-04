way.lib.dm.makeDbMakeDatabase = async function (_args){
  var _args = way.lib.getArgs('dm.makeDbMakeDatabase', _args);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      (async function() {

        // Carga entorno
        var envThis = await way.lib.decode({ data: way.env._this }).catch((o) => { return {} });

        // Determina y establece variables de ejecución
        await way.lib.dm.setDbExec({ base_image: _args.base_image });

        // Establece comando de ejecución en contenedor
        var docker_cmd_source = `docker exec -it --user root -e MYSQL_PWD=${_args.pass} ${_args.from_service}`;
        var db_access = `-h ${_args.host} -u ${_args.user}`;

        // Crea base de datos
        var db_query = `CREATE DATABASE IF NOT EXISTS "${_args.name}" CHARACTER SET "${_args.charset}" COLLATE "${_args.collation}";`;
        var docker_exec = `${docker_cmd_source} ${way.var.db_exec} ${db_access} -e "${db_query}"`;
        var out = await way.lib.exec({ cmd: `${docker_exec}`, out: true });
        if (way.lib.check(out.buffer)) {
          way.lib.log({ message: `${out.buffer}`, type: `warning` });
          var out = await way.lib.exec({ cmd: `rm ${way.var.target_database}.gz`, out: false });
        } else {
          way.lib.log({ message: `Created database "${_args.host}/${_args.name}"`, type: `success` });
        }

        // Crea usuario base de datos
        var db_query = `CREATE USER IF NOT EXISTS "${_args.user}"@"localhost" IDENTIFIED BY '${_args.pass}';`;
        var docker_exec = `${docker_cmd_source} ${way.var.db_exec} ${db_access} -e \"${db_query}\"`;
        var out = await way.lib.exec({ cmd: `${docker_exec}`, out: true });
        if (way.lib.check(out.buffer)) {
          way.lib.log({ message: `${out.buffer}`, type: `warning` });
          var out = await way.lib.exec({ cmd: `rm ${way.var.target_database}.gz`, out: false });
        } else {
          way.lib.log({ message: `Created database user "${_args.user}/${_args.pass}"`, type: `success` });
        }

        // Establece privilegios
        var db_query = `GRANT ALL PRIVILEGES ON ${_args.name}.* TO "${_args.user}"@"localhost"; FLUSH PRIVILEGES;`;
        var docker_exec = `${docker_cmd_source} ${way.var.db_exec} ${db_access} -e \"${db_query}\"`;
        var out = await way.lib.exec({ cmd: `${docker_exec}`, out: true });
        if (way.lib.check(out.buffer)) {
          way.lib.log({ message: `${out.buffer}`, type: `warning` });
          var out = await way.lib.exec({ cmd: `rm ${way.var.target_database}.gz`, out: false });
        } else {
          way.lib.log({ message: `Access granted to user "${_args.user}/localhost"`, type: `success` });
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