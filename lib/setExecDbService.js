way.lib.dm.setExecDbService = async function (_args){
  var _args = way.lib.getArgs('dm.setExecDbService', _args);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      (async function() {

        service_db_exec = _args.base_image.split(':')[0];
        switch (service_db_exec) {
          case 'mysql':
            service_db_exec_dump = `${service_db_exec}dump`;
            service_db_exec = `mysql`;
            break;
          case 'mariadb':
            service_db_exec_dump = `${service_db_exec}-dump`;
            service_db_exec = `mysql`;
            break;
          default:
            way.lib.exit(`No soportado ejecutable ${out['exec']}`);
            break;
        }
        // console.log(service_db_exec)
        // console.log(service_db_exec_dump)
        // way.lib.exit();

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