way.lib.dm.makeDbExport = async function (_args){
  var _args = way.lib.getArgs('dm.makeDbExport', _args);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      (async function() {

        // Carga entorno
        var envThis = await way.lib.decode({ data: way.env._this }).catch((o) => { return {} });

        // Comprobaciones
        if (_args.is_remote && envThis._env == 'local') {
          way.lib.exit(`Detected in ${envThis._env} environment is_remote=true`);
        }

        // Determina y establece variables de ejecución
        await way.lib.dm.setDbExec({ base_image: _args.base_image });

        // Establece comando de ejecución en contenedor
        var docker_cmd_source = `docker exec -it --user root -e MYSQL_PWD=${_args.pass} ${envThis._parent_key}-www`;
        var db_access = `-h ${_args.host} -u ${_args.user}`

        // Excluyendo tablas
        way.var.tables = '';
        way.var.excluded_tables = [];

        var db_query = `-B -e "use ${_args.name}; show tables"`;
        var docker_exec = `${docker_cmd_source} ${way.var.db_exec} ${db_access} ${db_query} | sed -e "s/^Tables.*//" | xargs -n1`;

        await way.lib.exec({ cmd: `${docker_exec}`, pipe: `tables`, out: false });
        way.var.tables.split('\n').forEach(table_name => {
          var found = _args.excluded_tables.find(element => new RegExp(`^${element}`,"g").test(table_name));
          if (typeof found !== 'undefined') {
            way.var.excluded_tables.push(`--ignore-table=${_args.name}.${table_name}`);
          }
        });
        way.var.excluded_tables = way.var.excluded_tables.join(' ');

        // Obtiene tag
        await way.lib.getTagFromString({ data: `${way.opt.tag}`, pipe: 'tag' });
        way.var.tag = `---${way.var.tag}`

        // Obtiene fecha
        await way.lib.getDate({ pipe: 'date' });

        // Obtiene destino de backup de base de datos
        way.var.target_database = `${_args.backup_db_path}/${envThis._config_name}---${_args.name}---${way.var.date}${way.var.tag}.sql`;

        // Establece comando para exportar base de datos
        var db_query = `--quick --max_allowed_packet=512M ${_args.name} ${way.var.excluded_tables}`;
        var docker_exec = `${docker_cmd_source} ${way.var.db_dump_exec} ${db_access} ${db_query} | gzip > ${way.var.target_database}.gz`;

        // Muestra información
        if (way.opt.v) {
          var log = [];
          log['env'] = envThis._env;
          log['tag'] = envThis._tag;
          way.lib.toCLI({ data: log, color: "gray", config: {} });
        }

        // Ejecuta comando
        await way.lib.exec({ cmd: `${docker_exec}`, pipe: `tables`, out: false });

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