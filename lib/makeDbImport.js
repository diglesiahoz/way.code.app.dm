way.lib.dm.makeDbImport = async function (_args){
  var _args = way.lib.getArgs('dm.makeDbImport', _args);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      (async function() {

        // Si detecta modo DRY-RUN obtiene último fichero
        if (way.opt.d) {
          //way.opt.last = true;
        }

        var source_file = _args.file;
        if (source_file == '' && way.opt.d) {
          source_file = `file.sql.gz`;
        }

        // Comprueba opciones
        if (way.lib.check(_args.file) && way.lib.check(way.opt.last) && way.opt.last && !way.opt.d) {
          way.lib.log({ message: `The last file is not obtained if the --file option is set`, type: 'warning' });  
        }
        // Obtiene ficheros
        var dumps = {};
        if (way.opt.d && way.lib.check(way.opt.last) && !way.opt.last) {
          dumps[source_file] = `${_args.backup_db_path}/${source_file}`;
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


        if (way.lib.check(dumps[_args.file])) {
          source_file = dumps[_args.file];
        } else {
          if (!way.opt.d && way.lib.check(_args.file)) {
            way.lib.log({ message: `File not found "${_args.file}"`, type: `warning` });  
          }
        }


        if (way.lib.check(way.opt.last) && way.opt.last) {
          var source_file = dumps[Object.keys(dumps)[0]];
        } else {
          if (!way.lib.check(source_file) && !(way.opt.d)) {
            var choice = await way.lib.complete({
              choices: Object.keys(dumps),
              message: `Select file to import...`
            });
            var source_file = dumps[choice];
          }
        }


        var filename = require('path').parse(source_file).base;


        // Descomprime base de datos en local
        if (!way.lib.check(_args.leap_from)) {
          if (require('path').parse(source_file).ext == '.gz') {
            var out = await way.lib.getRandomString({ length: 10 });
            var filename = require('path').parse(source_file).name;
            source_file = `${_args.backup_db_path}/${filename}.${out.data}`;
            var docker_exec = `gzip -c -d ${_args.backup_db_path}/${filename}.gz > ${source_file}`;
            way.lib.logRunning(`Unzipping database from "${_args.backup_db_path}/${filename}.gz"`);
            var out = await way.lib.exec({ cmd: `${docker_exec}`, out: false });
            way.lib.clearLogRunning();
            if (way.lib.check(out.buffer)) {
              way.lib.log({ message: `Could not unzipp database to "${source_file}"`, type: `warning` });
              var out = await way.lib.exec({ cmd: `rm ${source_file}`, out: false });
              way.lib.exit();
            } else {
              way.lib.log({ message: `Unzipped database to "${source_file}"`, type: `success` });
            }
          }
        }

        // Determina y establece variables de ejecución
        await way.lib.dm.setDbExec({ base_image: _args.base_image });


        if (way.lib.check(_args.leap_from)) {
          way.var.origin_database = `${_args.backup_db_path}/${filename}`;
        } else {
          way.var.origin_database = `/tmp/${filename}`;
        }


        // Sincroniza base de datos a servidor remoto
        if (way.lib.check(_args.leap_from)) {
          var exec = {};
          exec['out'] = true;
          exec['rsync_origin_file'] = way.var.origin_database;
          way.var.target_database = `/tmp/${filename}`;
          exec['rsync_target_file'] = `${_args.leap_from.user}@${_args.leap_from.host}:${way.var.target_database}`;

          exec.cmd = ``;
          var exec = Object.assign(exec, _args.leap_from);
          way.lib.logRunning(`Synchronizing database from "${exec['rsync_origin_file']}" to "${exec['rsync_target_file']}"`);
          var out = await way.lib.exec(exec);
          way.lib.clearLogRunning();
          if (way.lib.check(out.buffer)) {
            way.lib.log({ message: `Failed to sync database from "${exec['rsync_origin_file']}" to "${exec['rsync_target_file']}"`, type: `warning` });
            way.lib.exit();
          } else {
            way.lib.log({ message: `Synchronized database from "${exec['rsync_origin_file']}" to "${exec['rsync_target_file']}"`, type: `success` });
            // Descomprime base de datos en remoto
            var exec = {};
            exec['out'] = true;
            var out = await way.lib.getRandomString({ length: 10 });
            var target_file = `/tmp/${require('path').parse(source_file).base}`;
            var target_unzziped_file = `${require('path').parse(source_file).name}.${out.data}`;
            exec['cmd'] = `gzip -c -d ${way.var.target_database} > /tmp/${target_unzziped_file}`;
            var exec = Object.assign(exec, _args.leap_from);
            way.var.target_database_message = `${_args.leap_from.user}@${_args.leap_from.host}:/tmp/${target_unzziped_file}`;
            way.lib.logRunning(`Unzipping database from "${way.var.target_database_message}"`);
            var out = await way.lib.exec(exec);
            way.lib.clearLogRunning();
            if (way.lib.check(out.buffer)) {
              way.lib.log({ message: `Could not unzipp database to "${way.var.target_database_message}"`, type: `warning` });
              way.lib.exit();
            } else {
              way.lib.log({ message: `Unzipped database to "${way.var.target_database_message}"`, type: `success` });
              source_file = `/tmp/${target_unzziped_file}`;
            }
          }
        }

        // Inicializa ejecución
        var exec = {};
        exec['out'] = true;

        // Establece comando a ejecutar
        if (way.lib.check(_args.leap_from)) {
          var exec = Object.assign(exec, _args.leap_from);
          exec['cmd'] = `MYSQL_PWD=${_args.pass} ${way.var.db_exec} -h ${_args.host} -u ${_args.user}`;
        } else {
          exec['cmd'] = `docker exec -i --user root -e MYSQL_PWD=${_args.pass} ${_args.from_service} ${way.var.db_exec} -h ${_args.host} -u ${_args.user}`;
        }

        exec['cmd'] = `${exec['cmd']} --one-database ${_args.name} < ${source_file}`;

        // Importa base de datos
        way.lib.logRunning(`Importing database into "${_args.env_key}:${_args.host}/${_args.name}"`);
        var out = await way.lib.exec(exec);
        way.lib.clearLogRunning();
        if (way.lib.check(out.buffer)) {
          // TODO
        } else {
          way.lib.log({ message: `Imported database into "${_args.env_key}:${_args.host}/${_args.name}"`, type: `success` });
          // Elimina base de datos exportada en remoto.
          if (way.lib.check(_args.leap_from)) {
            var exec = {};
            exec['out'] = true;
            exec['cmd'] = `rm ${source_file} && rm ${target_file}`;
            var exec = Object.assign(exec, _args.leap_from);
            way.lib.logRunning(`Deleting database from "${_args.leap_from.user}@${_args.leap_from.host}:${source_file}"`);
            var out = await way.lib.exec(exec);
            way.lib.clearLogRunning();
            if (way.lib.check(out.buffer)) {
              way.lib.log({ message: `Could not remove database from "${_args.leap_from.user}@${_args.leap_from.host}:${source_file}"`, type: `warning` });
              way.lib.log({ message: `Could not remove database from "${_args.leap_from.user}@${_args.leap_from.host}:${target_file}"`, type: `warning` });
            } else {
              way.lib.log({ message: `Removed database from "${_args.leap_from.user}@${_args.leap_from.host}:${source_file}"`, type: `success` });
              way.lib.log({ message: `Removed database from "${_args.leap_from.user}@${_args.leap_from.host}:${target_file}"`, type: `success` });
            }
          } else {
            way.lib.logRunning(`Deleting database from "${source_file}"`);
            var out = await way.lib.exec({ cmd: `rm ${source_file}`, out: false });
            if (way.lib.check(out.buffer)) {
              way.lib.log({ message: `${out.buffer}`, type: `error` });
            }
            way.lib.clearLogRunning();
            if (way.lib.check(out.buffer)) {
              way.lib.log({ message: `Could not remove "${source_file}"`, type: `warning` });
            } else {
              way.lib.log({ message: `Removed database "${source_file}"`, type: `success` });
            }
          }
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