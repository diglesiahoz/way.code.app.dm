way.lib.dm.makeDbAccess = async function (_args){
  var _args = way.lib.getArgs('dm.makeDbAccess', _args);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      (async function() {

        // Carga entorno
        var envThis = await way.lib.decode({ data: way.env._this }).catch((o) => { return {} });

        // Determina y establece variables de ejecución
        await way.lib.dm.setDbExec({ base_image: _args.base_image });

        // Establece comando de ejecución en contenedor
        var docker_cmd_source = `docker exec -it --user root -e MYSQL_PWD=${_args.pass} ${_args.from_service}`;
        var db_access = `-h ${_args.host} -u ${_args.user}`
        var db_query = ``;
        var docker_exec = `${docker_cmd_source} ${way.var.db_exec} ${db_access} ${db_query}`;

        // Muestra información
        if (way.opt.v) {
          var log = [];
          log['env'] = envThis._env;
          log['tag'] = envThis._tag;
          log['docker_exec'] = docker_exec;
          way.lib.toCLI({ data: log, color: "gray", config: {} });
        }

        // Ejecuta comando
        try {
          await way.lib.exec({ cmd: `${docker_exec}`, out: true });
        } catch (e) { }

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