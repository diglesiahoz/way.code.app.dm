way.lib.dm.makeDbExport = async function (_args){
  var _args = way.lib.getArgs('dm.makeDbExport', _args);
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

        // Excluyendo tablas
        way.var.excluded_tables = [];
        if (_args.excluded_tables.length > 0) {
          way.var.tables = '';
          
          var db_query = `-B -e "use ${_args.name}; show tables"`;
          var docker_exec = `${docker_cmd_source} ${way.var.db_exec} ${db_access} ${db_query} | sed -e "s/^Tables.*//" | xargs -n1`;

          way.lib.logRunning(`Excluding database tables`);
          await way.lib.exec({ cmd: `${docker_exec}`, exclude_dryrun: true, pipe: `tables`, out: false });
          way.var.tables.split('\n').forEach(table_name => {
            var found = _args.excluded_tables.find(element => new RegExp(`^${element}`,"g").test(table_name));
            if (typeof found !== 'undefined') {
              way.var.excluded_tables.push(`--ignore-table=${_args.name}.${table_name}`);
            }
          });
          way.var.excluded_tables = way.var.excluded_tables.join(' ');
          way.lib.clearLogRunning();
        }

        // Obtiene tag
        await way.lib.getTagFromString({ data: `${way.opt.tag}`, pipe: 'tag' });
        if (way.lib.check(way.var.tag)) { 
          way.var.tag = `---${way.var.tag}`;
        }

        // Obtiene fecha
        await way.lib.getDate({ pipe: 'date' });

        // Obtiene destino de backup de base de datos
        var filename = `${envThis._key}.${envThis._env}---${_args.name}---${way.var.date}${way.var.tag}.sql`;
        way.var.target_database = (way.opt.d) ? `${_args.backup_db_path}/file.sql` : `${_args.backup_db_path}/${filename}`;

        // Establece comando para exportar base de datos
        // Ejemplos opciones:
        // * --single-transaction --skip-opt --create-options --add-drop-table --disable-keys --extended-insert --routines --quick --set-charset --log_error=$SALIDA_ERR -u $USER -p$PASSWORD --databases $db | gzip > $DESTINO/$db.sql_${FECHA}.gz
        // * --no-autocommit --single-transaction --opt -Q --no-tablespaces
        // * --set-gtid-purged=OFF --skip-triggers --lock-tables=false
        var dump_options = (way.lib.check(way.opt['lock']) && way.opt['lock']) ? `--lock-tables ${_args.dump_options}` : `--single-transaction ${_args.dump_options}` ;
        var db_query = `${dump_options} ${_args.name} ${way.var.excluded_tables}`;
        var docker_exec = `${docker_cmd_source} ${way.var.db_dump_exec} ${db_access} ${db_query} | gzip > ${way.var.target_database}.gz`;

        // // Muestra información
        // if (way.opt.v) {
        //   var log = [];
        //   log['env'] = envThis._env;
        //   log['tag'] = envThis._tag;
        //   way.lib.toCLI({ data: log, color: "gray", config: {} });
        // }

        // Exporta base de datos
        way.lib.logRunning(`Exporting database from "${envThis._env}:${_args.host}/${_args.name}"`);
        var out = await way.lib.exec({ cmd: `${docker_exec}`, out: false });
        way.lib.clearLogRunning();
        if (way.lib.check(out.buffer)) {
          way.lib.log({ message: `${out.buffer}`, type: `warning` });
          var out = await way.lib.exec({ cmd: `rm ${way.var.target_database}.gz`, out: false });
        } else {
          way.lib.log({ message: `Exported database from "${envThis._env}:${_args.host}/${_args.name}"`, type: `success` });
        }

        // Devuelve información
        return resolve({
          args: Object.assign({}, _args),
          attach: {},
          code: 0,
          data: {
            file: (way.opt.d) ? `file.sql.gz` : `${filename}.gz`,
          },
        });

      })();
    }, 0); 
  });
}