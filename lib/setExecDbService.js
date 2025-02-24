way.lib.dm.setExecDbService = async function (_args){
  var _args = way.lib.getArgs('dm.setExecDbService', _args);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      (async function() {

        var base_image_array = _args.base_image.split(':');
        service_db_exec = base_image_array[0];
        service_db_release = base_image_array[1];
        switch (service_db_exec) {
          case 'mysql':
            service_db_exec_dump = `mysqldump`;
            service_db_exec = `mysql`;
            break;
          case 'mariadb':
            if (service_db_release.match(/^10/)) {
              service_db_exec_dump = `mysqldump`;
              service_db_exec = `mysql`;
            }
            if (service_db_release.match(/^11/)) {
              service_db_exec_dump = `${service_db_exec}-dump`;
              service_db_exec = `mariadb`;
            }
            break;
          default:
            way.lib.exit(`No soportado ejecutable ${out['exec']}`);
            break;
        }

        way.lib.log({ message: `service_db_exec: ${service_db_exec}`, type: 'label' });
        way.lib.log({ message: `service_db_exec_dump: ${service_db_exec_dump}`, type: 'label' });

        way.lib.var({ key: 'service_db_exec', value: service_db_exec });
        way.lib.var({ key: 'service_db_exec_dump', value: service_db_exec_dump });

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