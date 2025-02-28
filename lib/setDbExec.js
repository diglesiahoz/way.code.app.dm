way.lib.dm.setDbExec = async function (_args){
  var _args = way.lib.getArgs('dm.setDbExec', _args);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      (async function() {

        var base_image_array = _args.base_image.split(':');
        db_exec = base_image_array[0];
        service_db_release = base_image_array[1];
        switch (db_exec) {
          case 'mysql':
            db_dump_exec = `mysqldump`;
            db_exec = `mysql`;
            break;
          case 'mariadb':
            if (service_db_release.match(/^10/)) {
              db_dump_exec = `mysqldump`;
              db_exec = `mysql`;
            }
            if (service_db_release.match(/^11/)) {
              db_dump_exec = `${db_exec}-dump`;
              db_exec = `mariadb`;
            }
            break;
          default:
            way.lib.exit(`No soportado ejecutable ${out['exec']}`);
            break;
        }

        way.var.db_exec = db_exec;
        way.var.db_dump_exec = db_dump_exec;
        
        if (way.opt.v) {
          var log = [];
          log['db_exec'] = way.var.db_exec;
          log['db_dump_exec'] = way.var.db_dump_exec;
          way.lib.toCLI({ data: log, color: "gray", config: {} });
        }

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