way.lib.dm.makeDbAccess = async function (_args){
  var _args = way.lib.getArgs('dm.makeDbAccess', _args);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      (async function() {

        // Carga entorno
        var envThis = await way.lib.decode({ data: way.env._this }).catch((o) => { return {} });

        // Determina y establece variables de ejecución
        await way.lib.dm.setDbExec({ base_image: _args.base_image });

        // Inicializa ejecución
        var exec = {};
        exec['out'] = true;

        // Establece comando a ejecutar
        if (way.lib.check(_args.leap_from)) {
          var exec = Object.assign(exec, _args.leap_from);
          exec['cmd'] = `MYSQL_PWD=${_args.pass} ${way.var.db_exec} -h ${_args.host} -u ${_args.user}`;
        } else {
          exec['cmd'] = `docker exec -it --user root -e MYSQL_PWD=${_args.pass} ${_args.from_service} ${way.var.db_exec} -h ${_args.host} -u ${_args.user}`;
        }
        var db_query = ``;
        exec['cmd'] = `${exec['cmd']} ${db_query}`;

        // Muestra información
        if (way.opt.v) {
          var log = [];
          log['env'] = envThis._env;
          log['key'] = envThis._tag;
          log['exec'] = exec;
          way.lib.toCLI({ data: log, color: "gray", config: {} });
        }

        // Ejecuta comando
        try {
          await way.lib.exec(exec);
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