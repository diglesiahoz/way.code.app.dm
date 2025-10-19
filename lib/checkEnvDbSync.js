way.lib.dm.checkEnvDbSync = async function (_args){
  var _args = way.lib.getArgs('dm.checkEnvDbSync', _args);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      (async function() {

        var color = require('ansi-colors');

        //console.log(way.env)
        

        var origin = way.env.origin;
        var target = way.env.target;

        if (origin._env == target._env) {
          way.lib.exit(`Source and target environment is the same`);
        }

        if (origin._parent_key != target._parent_key) {
          //way.lib.exit(`Constraint detected from "${way.proc.name}". Different parent environment (${origin._parent_key} != ${target._parent_key})`);
        }

        switch (origin._env) {
          case 'local':
            var origin_primary_env_color = `green`;
            break;
          case 'pre':
          case 'dev':
          case 'test':
          case 'stage':
            var origin_primary_env_color = `yellow`;
            break;
          case 'prod':
            var origin_primary_env_color = `red`;
            break;
          default:
            var origin_primary_env_color = `white`;
        }
        switch (target._env) {
          case 'local':
            var target_primary_env_color = `green`;
            break;
          case 'pre':
          case 'dev':
          case 'test':
          case 'stage':
            var target_primary_env_color = `yellow`;
            break;
          case 'prod':
            var target_primary_env_color = `red`;
            break;
          default:
            var target_primary_env_color = `white`;
        }

        var origin_sig = `color.bold.${origin_primary_env_color}("${origin._env}:${origin.appsetting.service.db.host.sv}/${origin.appsetting.service.db.name}")`;
        var target_sig = `color.bold.${target_primary_env_color}("${target._env}:${target.appsetting.service.db.host.sv}/${target.appsetting.service.db.name}")`;
        //var color_name = String(target_primary_env_color).charAt(0).toUpperCase() + String(target_primary_env_color).slice(1);
        //var sync_status = `color.bg${color_name}.${target_secondary_env_color}(" SYNC ")`;
        var sync_status = `color.dim.${target_primary_env_color}(" SYNC ")`;
        var sync_arrow_begin = `color.dim.${target_primary_env_color}("===")`;
        var sync_arrow_end = `color.dim.${target_primary_env_color}("===>")`;

        console.log(`${eval(origin_sig)} ${eval(sync_arrow_begin)}${eval(sync_status)}${eval(sync_arrow_end)} ${eval(target_sig)}`);
        if (target._env != 'local' && !way.opt.d) {
          way.opt.y = false;
        }
        await way.lib.ask({
          message: `Are you sure you want to sync the "${origin._env}" database to the "${target._env}" environment?`,
          exitIfNegative: true
        });

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