way.lib.dm.checkEnv = async function (_args){
  var _args = way.lib.getArgs('dm.checkEnv', _args);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      (async function() {

        if (_args.type == 'sync' && (_args.source_env == _args.target_env) ) {
          way.lib.exit(`Source and target environment is the same`);
        }

        switch (_args.source_env) {
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
        switch (_args.target_env) {
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

        switch (_args.type) {
          case 'sync':
            var origin_sig_env = `require('ansi-colors').bold.${origin_primary_env_color}("${_args.source_env}")`;
            var origin_sig = `require('ansi-colors').dim.${origin_primary_env_color}("${_args.source_extra_info}")`;
            var sync_arrow_begin = `require('ansi-colors').dim.${target_primary_env_color}("===")`;
            var sync_status = `require('ansi-colors').dim.${target_primary_env_color}(" SYNC ")`;
            var sync_arrow_end = `require('ansi-colors').dim.${target_primary_env_color}("===>")`;
            var target_sig_env = `require('ansi-colors').bold.${target_primary_env_color}("${_args.target_env}")`;
            var target_sig = `require('ansi-colors').dim.${target_primary_env_color}("${_args.target_extra_info}")`;
            console.log(`${eval(origin_sig_env)} ${eval(origin_sig)} ${eval(sync_arrow_begin)}${eval(sync_status)}${eval(sync_arrow_end)} ${eval(target_sig_env)} ${eval(target_sig)}`);
            break;
          case 'exec':
            var origin_sig_env = `require('ansi-colors').bold.${origin_primary_env_color}("${_args.source_env}")`;
            var origin_sig = `require('ansi-colors').dim.${origin_primary_env_color}("${_args.source_extra_info}")`;
            var sync_arrow_begin = `require('ansi-colors').dim.${target_primary_env_color}("===")`;
            var sync_status = `require('ansi-colors').dim.${target_primary_env_color}(" EXEC ")`;
            var sync_arrow_end = `require('ansi-colors').dim.${target_primary_env_color}("===>")`;
            console.log(`${eval(origin_sig_env)} ${eval(sync_arrow_begin)}${eval(sync_status)}${eval(sync_arrow_end)} ${eval(origin_sig)} `);
            break;
        }

        if (_args.target_env != 'local' && !way.opt.d) {
          way.opt.y = false;
        }
        await way.lib.ask({
          message: `Are you sure you want to continue?`,
          exitIfNegative: true,
          color: `dim.${target_primary_env_color}`
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