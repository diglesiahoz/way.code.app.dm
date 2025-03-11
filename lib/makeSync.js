way.lib.dm.makeSync = async function (_args){
  var _args = way.lib.getArgs('dm.makeSync', _args);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      (async function() {

        // Carga entorno
        var envThis = await way.lib.decode({ data: way.env._this }).catch((o) => { return {} });
        //console.log(envThis._parent_key);

        // Obtiene entornos
        var tmp = _args.env_key.split(':');
        var source_env_key = tmp[0].split('-')[0];
        var target_env_key = tmp[0].split('-')[2];
        var tag = (way.lib.check(tmp[1])) ? tmp[1] : '';
        // console.log(`${envThis._parent_key}.${source_env_key}`);
        // console.log(`${envThis._parent_key}.${target_env_key}`);
        // console.log(`${tag}`);

        try {
          // Carga perfil de configuración de origen
          var source_config = await way.lib.loadConfig({
            key: [`@${envThis._parent_key}.${source_env_key}`],
            force: true
          }).catch((o) => {
            return {};
          });
          if (way.lib.check(tag)) {
            var source_path = `${source_config.tags[tag]}`;
          } else {
            // Establece directorio raiz de origen y la ruta de origen es relativa
            var source_path = `${_args.source_path}`;
            if (!_args.source_path.startsWith('/')) {
              var source_root = eval(`source_config.appsetting.root`);
              if (!way.lib.check(source_root)) {
                way.lib.exit(`Required "appsetting.root" from "${source_config._config_name}"`);
              }
              var source_path = `${source_root}/${_args.source_path}`;
            }
          }
        } catch (e) {}
        
        try {
          // Carga perfil de configuración de destino
          var target_config = await way.lib.loadConfig({
            key: [`@${envThis._parent_key}.${target_env_key}`],
            force: true
          }).catch((o) => {
            return {};
          }); 
          if (way.lib.check(tag)) {
            var target_path = `${target_config.tags[tag]}`;
          } else {
            // Establece directorio raiz de destino y la ruta de destino es relativa
            var target_path = `${_args.target_path}`;
            if (!_args.target_path.startsWith('/')) {
              var target_root = eval(`target_config.appsetting.root`);
              if (!way.lib.check(target_root)) {
                way.lib.exit(`Required "appsetting.root" from "${target_config._config_name}"`);
              }
              if (!way.lib.check(_args.target_path)) {
                var target_path = (_args.source_path.startsWith('/')) ? `${_args.source_path}` : `${target_root}/${_args.source_path}`;
              } else {
                var target_path = `${target_root}/${_args.target_path}`;
              }
            }
          }
        } catch (e) {}
        
        // way.lib.log({ message: `Source path: ${source_path}`, type: 'label' });
        // way.lib.log({ message: `Target path: ${target_path}`, type: 'label' });

        // Establece rsync
        var rsync_cmds = [];
        _args.rsync_options = (way.lib.check(way.opt["delete"]) && way.opt["delete"]) ? `--delete ${_args.rsync_options}`: `${_args.rsync_options}`;
        _args.rsync_options = (way.lib.check(way.opt["dry-run"]) && way.opt["dry-run"]) ? `--dry-run ${_args.rsync_options}`: `${_args.rsync_options}`;

        // Establece origen
        var source_exec = {};
        try {
          var source_exec = source_config.hook.call['dm.access'].exec;
          if (!way.lib.check(source_exec.user)) way.lib.exit(`Required "user" setting from "${source_config._config_name}..hook.call['dm.access'].exec"`);
          if (!way.lib.check(source_exec.host)) way.lib.exit(`Required "host" setting from "${source_config._config_name}..hook.call['dm.access'].exec"`);
          if (way.lib.check(source_exec.pass)) {
            rsync_cmds.push(`sshpass -p "${source_exec.pass}" rsync ${_args.rsync_options}`);
          } else {
            rsync_cmds.push(`rsync ${_args.rsync_options}`);
          }
          source_path = `${source_exec.user}@${source_exec.host}:${source_path}`;
        } catch (e) { }

        // Establece destino
        var target_exec = {}
        try {
          var target_exec = target_config.hook.call['dm.access'].exec;
          if (!way.lib.check(target_exec.user)) way.lib.exit(`Required "user" setting from "${target_config._config_name}..hook.call['dm.access'].exec"`);
          if (!way.lib.check(target_exec.host)) way.lib.exit(`Required "host" setting from "${target_config._config_name}..hook.call['dm.access'].exec"`);
          if (way.lib.check(target_exec.pass)) {
            rsync_cmds.push(`sshpass -p "${target_exec.pass}" rsync ${_args.rsync_options}`);
          } else {
            rsync_cmds.push(`rsync ${_args.rsync_options}`);
          }
          target_path = `${target_exec.user}@${target_exec.host}:${target_path}`;
        } catch (e) { }

        
        rsync_cmds.push(`${source_path}`);
        rsync_cmds.push(`${target_path}`);
        //console.log(rsync_cmds);way.lib.exit()
        
        // Muestra información
        //way.lib.log({ message: `${rsync_cmds.join(' ')}`, type: 'label' });

         // Monta ejecución y ejecuta
        var docker_exec = {};
        docker_exec['cmd'] = rsync_cmds.join(' ');
        docker_exec['out'] = true;
        way.lib.logRunning(`Sync "${_args.env_key}" files`);
        try {
          var out = await way.lib.exec(docker_exec);
          //if (way.lib.check(out.buffer)) {
          //  way.lib.log({ message: `${out.buffer}`, type: `warning` });
          //} else {
          //  way.lib.log({ message: `OK`, type: `success` });
          //}
        } catch (e) {
          //console.log(e)
        }
        way.lib.clearLogRunning();


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