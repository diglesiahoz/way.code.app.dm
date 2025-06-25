way.lib.dm.makeDbImport = async function (_args){
  var _args = way.lib.getArgs('dm.makeDbImport', _args);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      (async function() {

        // Carga entorno
        var envThis = await way.lib.decode({ data: way.env._this }).catch((o) => { return {} });

        // Si detecta modo DRY-RUN obtiene último fichero
        if (way.opt.d) {
          //way.opt.last = true;
        }

        // Comprueba opciones
        if (way.lib.check(_args.file) && way.lib.check(way.opt.last) && way.opt.last && !way.opt.d) {
          way.lib.log({ message: `The last file is not obtained if the --file option is set`, type: 'warning' });  
        }
        // Obtiene ficheros
        var dumps = {};
        if (way.opt.d) {
          dumps['file.sql.gz'] = `${_args.backup_db_path}/file.sql.gz`;
        } else {
          var dump_files = await require('glob').sync(`${_args.backup_db_path}/*{.sql,.sql.gz}`, { stat: true, withFileTypes: true })
          var dump_files_sorted = dump_files.sort((a, b) => a.mtimeMs - b.mtimeMs).map(path => path.fullpath()).reverse();
          dump_files_sorted.map(abs_path => {
            dumps[require('path').basename(abs_path)] = abs_path;
          });
          if (!way.lib.check(dumps) && Object.keys(dumps).length == 0) {
            way.lib.exit(`No databases (.sql|.sql.gz) were found to import files from "${_args.backup_db_path}"`);
          }
        }
        var source_file = (way.opt.d) ? `file.sql.gz` : '';
        if (way.lib.check(_args.file)) {
          if (way.lib.check(dumps[_args.file])) {
            source_file = dumps[_args.file];
          } else {
            way.lib.log({ message: `File not found "${_args.file}"`, type: `warning` });  
          }
        }
        if (!way.lib.check(source_file)) {
          if (way.lib.check(way.opt.last) && way.opt.last && !way.lib.check(_args.file)) {
            var source_file = dumps[Object.keys(dumps)[0]];
          } else {
            var choice = await way.lib.complete({
              choices: Object.keys(dumps),
              message: `Select file to import...`
            });
            var source_file = dumps[choice];
          }
        }
        var filename = require('path').parse(source_file).name;
        if (require('path').parse(source_file).ext == '.gz') {
          var out = await way.lib.getRandomString({ length: 10 });
          source_file = `${_args.backup_db_path}/${filename}.${out.data}`;
          var docker_exec = `gzip -c -d ${_args.backup_db_path}/${filename}.gz > ${source_file}`;
          var out = await way.lib.exec({ cmd: `${docker_exec}`, out: false });
          if (way.lib.check(out.buffer)) {
            way.lib.log({ message: `${out.buffer}`, type: `error` });
            var out = await way.lib.exec({ cmd: `rm ${source_file}`, out: false });
          }
        }

        // Determina y establece variables de ejecución
        await way.lib.dm.setDbExec({ base_image: _args.base_image });

        // Establece comando de ejecución en contenedor
        var docker_cmd_source = `docker exec -i --user root -e MYSQL_PWD=${_args.pass} ${_args.from_service}`;
        var db_access = `-h ${_args.host} -u ${_args.user}`

        // Vacia tablas
        if (way.opt.drop) {
          if (envThis._env != 'local' && !way.opt.d) {
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
          way.lib.logRunning(`Deleting data from database "${envThis._env}:${_args.host}/${_args.name}"`);
          for (let key in bulk_cmd) {
            if (Object.hasOwnProperty.call(bulk_cmd, key)) {
              var out = await way.lib.exec({ cmd: `${bulk_cmd[key]}`, out: false });
              if (way.lib.check(out.buffer)) {
                way.lib.log({ message: `${out.buffer}`, type: `error` });
              }
            }
          }
        }

        // Establece comando para importar base de datos
        var db_query = `--one-database ${_args.name}`;
        var docker_exec = `${docker_cmd_source} ${way.var.db_exec} ${db_access} ${db_query} < ${source_file}`;

        // // Muestra información
        // if (way.opt.v) {
        //   var log = [];
        //   log['env'] = envThis._env;
        //   log['tag'] = envThis._tag;
        //   way.lib.toCLI({ data: log, color: "gray", config: {} });
        // }

        // Importa base de datos
        way.lib.logRunning(`Importing database into "${envThis._env}:${_args.host}/${_args.name}"`);
        var out = await way.lib.exec({ cmd: `${docker_exec}`, out: false });
        way.lib.clearLogRunning();
        if (way.lib.check(out.buffer)) {
          way.lib.log({ message: `${out.buffer}`, type: `warning` });
          var out = await way.lib.exec({ cmd: `rm ${source_file}`, out: false });
        } else {
          var out = await way.lib.exec({ cmd: `rm ${source_file}`, out: false });
          if (way.lib.check(out.buffer)) {
            way.lib.log({ message: `${out.buffer}`, type: `error` });
          }
          way.lib.log({ message: `Imported database into "${envThis._env}:${_args.host}/${_args.name}"`, type: `success` });
        }

        // Devuelve información
        return resolve({
          args: Object.assign({}, _args),
          attach: {},
          code: 0,
          data: source_file,
        });

      })();
    }, 0); 
  });
}