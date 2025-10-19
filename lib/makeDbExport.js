way.lib.dm.makeDbExport = async function (_args){
  var _args = way.lib.getArgs('dm.makeDbExport', _args);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      (async function() {

        // Determina y establece variables de ejecución
        await way.lib.dm.setDbExec({ base_image: _args.base_image });

        way.var.db_exec = way.var.db_dump_exec;

        // Inicializa ejecución
        var exec = {};
        exec['out'] = true;

        // Establece comando a ejecutar
        if (way.lib.check(_args.leap_from)) {
          var exec = Object.assign(exec, _args.leap_from);
          exec['cmd'] = `MYSQL_PWD=${_args.pass} ${way.var.db_dump_exec} -h ${_args.host} -u ${_args.user}`;
        } else {
          exec['cmd'] = `docker exec -it --user root -e MYSQL_PWD=${_args.pass} ${_args.from_service} ${way.var.db_dump_exec} -h ${_args.host} -u ${_args.user}`;
        }

        // Excluyendo tablas
        way.var.excluded_tables = [];
        if (_args.excluded_tables.length > 0) {
          way.var.tables = '';
          
          var db_query = `-B -e "use ${_args.name}; show tables"`;
          exec['cmd'] = `${exec['cmd']} ${db_query} | sed -e "s/^Tables.*//" | xargs -n1`;

          way.lib.logRunning(`Excluding database tables`);
          await way.lib.exec({ cmd: `${exec['cmd']}`, exclude_dryrun: true, pipe: `tables`, out: false });
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
        var filename = `${way.env.origin._config_name}---${_args.name}---${way.var.date}${way.var.tag}.sql.gz`;

        if (way.lib.check(_args.leap_from)) {
          way.var.target_database = `/tmp/${filename}`;
        } else {
          way.var.target_database = `${_args.backup_db_path}/${filename}`;
        }

        // Establece comando para exportar base de datos
        // Ejemplos opciones:
        // * --single-transaction --skip-opt --create-options --add-drop-table --disable-keys --extended-insert --routines --quick --set-charset --log_error=$SALIDA_ERR -u $USER -p$PASSWORD --databases $db | gzip > $DESTINO/$db.sql_${FECHA}.gz
        // * --no-autocommit --single-transaction --opt -Q --no-tablespaces
        // * --set-gtid-purged=OFF --skip-triggers --lock-tables=false
        
        // var dump_options = (way.lib.check(way.opt['lock']) && way.opt['lock']) ? `--lock-tables ${_args.dump_options}` : `--single-transaction ${_args.dump_options}` ;
        // var db_query = `${dump_options} ${_args.name} ${way.var.excluded_tables}`;
        // var docker_exec = `${docker_cmd_source} ${way.var.db_dump_exec} ${db_access} ${db_query} | gzip > ${way.var.target_database}.gz`;

        // Inicializa ejecución
        var exec = {};
        exec['out'] = true;

        // Establece comando a ejecutar
        if (way.lib.check(_args.leap_from)) {
          var exec = Object.assign(exec, _args.leap_from);
          exec['cmd'] = `MYSQL_PWD=${_args.pass} ${way.var.db_dump_exec} -h ${_args.host} -u ${_args.user}`;
        } else {
          exec['cmd'] = `docker exec -it --user root -e MYSQL_PWD=${_args.pass} ${_args.from_service} ${way.var.db_dump_exec} -h ${_args.host} -u ${_args.user}`;
        }
        var dump_options = (way.lib.check(way.opt['lock']) && way.opt['lock']) ? `--lock-tables ${_args.dump_options}` : `--single-transaction ${_args.dump_options}` ;
        var db_query = `${dump_options} ${_args.name} ${way.var.excluded_tables}`;
        db_query = db_query.trim();
        exec['cmd'] = `${exec['cmd']} ${db_query} | gzip > ${way.var.target_database}`;

        // Exporta base de datos
        way.lib.logRunning(`Exporting database from "${_args.env_key}:${_args.host}/${_args.name}"`);
        var out = await way.lib.exec(exec);
        way.lib.clearLogRunning();
        if (way.lib.check(out.buffer)) {
          // TODO
        } else {
          way.lib.log({ message: `Exported database from "${_args.env_key}:${_args.host}/${_args.name}"`, type: `success` });
          // Obtiene base de datos desde servidor remoto
          if (way.lib.check(_args.leap_from)) {
            var exec = {};
            exec['out'] = true;
            way.var.origin_database = `${way.var.target_database}`;
            exec['rsync_origin_file'] = `${_args.leap_from.user}@${_args.leap_from.host}:${way.var.origin_database}`;
            way.var.origin_database_message = exec['rsync_origin_file'];
            way.var.target_database = `${_args.backup_db_path}/${filename}`;
            exec['rsync_target_file'] = way.var.target_database;
            exec.cmd = ``;
            var exec = Object.assign(exec, _args.leap_from);
            way.lib.logRunning(`Synchronizing database from "${_args.env_key}:${_args.host}/${_args.name}" to "${way.var.target_database}"`);
            var out = await way.lib.exec(exec);
            way.lib.clearLogRunning();
            if (way.lib.check(out.buffer)) {
              way.lib.log({ message: `Failed to sync database from "${exec['rsync_origin_file']}" to "${exec['rsync_target_file']}"`, type: `warning` });
            } else {
              way.lib.log({ message: `Synchronized database from "${exec['rsync_origin_file']}" to "${exec['rsync_target_file']}"`, type: `success` });
              // Elimina base de datos exportada en remoto.
              var exec = {};
              exec['out'] = true;
              exec['cmd'] = `rm ${way.var.origin_database}`;
              var exec = Object.assign(exec, _args.leap_from);
              way.lib.logRunning(`Deleting database "${way.var.origin_database_message}"`);
              var out = await way.lib.exec(exec);
              way.lib.clearLogRunning();
              if (way.lib.check(out.buffer)) {
                way.lib.log({ message: `Could not remove database from "${way.var.origin_database_message}"`, type: `warning` });
              } else {
                way.lib.log({ message: `Removed database from "${way.var.origin_database_message}"`, type: `success` });
              }
            }
          }
        }

        // Devuelve información
        return resolve({
          args: Object.assign({}, _args),
          attach: {},
          code: 0,
          data: {
            file: `${filename}`,
          },
        });

      })();
    }, 0); 
  });
}