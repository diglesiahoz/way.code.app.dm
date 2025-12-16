way.lib.dm.makeSync = async function (_args){
  var _args = way.lib.getArgs('dm.makeSync', _args);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      (async function() {

        // Carga entorno
        var envThis = await way.lib.decode({ data: way.env._this }).catch((o) => { return {} });

        // Obtiene entornos
        var tmp = _args.env_key.split(':');
        var source_env_key = tmp[0].split('-')[0];
        var target_env_key = tmp[0].split('-')[2];
        var tag = (way.lib.check(tmp[1])) ? tmp[1] : '';
        var sshpass = ``;

        // Carga origen
        var source_config = await way.lib.loadConfig({
          key: [`@${envThis._tag}.${source_env_key}`],
          force: true
        }).catch((o) => {
          return {};
        });
        if (way.lib.check(tag)) {
          var source = `${source_config.tags[tag]}`;
        } else {
          try {
            var source = `${source_config._root}`;
          } catch (e) {
            var source = undefined;
          }
        }
        if (!way.lib.check(source) || source === 'undefined') {
          way.lib.exit(`Required "_root" from "${source_config._config_name}"`);
        }
        if (source_config._env != 'local') {
          if (!way.lib.check(source_config.server_access)) {
            way.lib.exit(`Required "server_access" from "${source_config._config_name}"`);
          } else {
            way.lib.check(source_config.server_access.user) ||
              way.lib.exit(`Required "server_access.user" from "${source_config._config_name}"`);
            way.lib.check(source_config.server_access.host) ||
              way.lib.exit(`Required "server_access.host" from "${source_config._config_name}"`);
            
            try {
              sshpass = source_config.server_access.pass;
            } catch (e) {
              sshpass = undefined;
            }

            source = `${source_config.server_access.user}@${source_config.server_access.host}:${source}`
          }
        }

        // Carga destino
        var target_config = await way.lib.loadConfig({
          key: [`@${envThis._tag}.${target_env_key}`],
          force: true
        }).catch((o) => {
          return {};
        });
        if (way.lib.check(tag)) {
          var target = `${target_config.tags[tag]}`;
        } else {
          try {
            var target = `${target_config._root}`;
          } catch (e) {
            var target = undefined;
          }
        }
        if (!way.lib.check(target) || target === 'undefined') {
          way.lib.exit(`Required "_root" from "${target_config._config_name}"`);
        }
        if (target_config._env != 'local') {
          if (!way.lib.check(target_config.server_access)) {
            way.lib.exit(`Required "server_access" from "${target_config._config_name}"`);
          } else {
            way.lib.check(target_config.server_access.user) ||
              way.lib.exit(`Required "server_access.user" from "${target_config._config_name}"`);
            way.lib.check(target_config.server_access.host) ||
              way.lib.exit(`Required "server_access.host" from "${target_config._config_name}"`);
            
            if (!way.lib.check(sshpass)) {
              try {
                sshpass = target_config.server_access.pass;
              } catch (e) {
                sshpass = undefined;
              }
            }

            target = `${target_config.server_access.user}@${target_config.server_access.host}:${target}`
          }
        }

        // Realiza validación
        if (way.lib.check(source_config.server_access) && way.lib.check(target_config.server_access)) {
          way.lib.exit(`Rsync between remote servers is not supported.`)
        }

        // Determina si es necesario añadir barra final
        source = (!target.endsWith('/')) ? `${source}/` : `${source}`;
        target = (!target.endsWith('/')) ? `${target}/` : `${target}`;

        // Añade opciones
        _args.rsync_options = (way.lib.check(way.opt["delete"]) && way.opt["delete"]) ? `--delete ${_args.rsync_options}`: `${_args.rsync_options}`;
        _args.rsync_options = (way.lib.check(way.opt["dry-run"]) && way.opt["dry-run"]) ? `--dry-run ${_args.rsync_options}`: `${_args.rsync_options}`;

        // Pregunta de control
        await way.lib.dm.checkEnv({
          type: 'sync',
          source_env: `${source_config._env}`,
          source_extra_info: `{${source}}`,
          target_env: `${target_config._env}`,
          target_extra_info: `{${target}}`,
        });

        // Monta comando rsync
        var exec = {};
        exec['out'] = true;
        if (way.lib.check(sshpass)) {
          exec['cmd'] = `sshpass -p "${sshpass}"`;
        }
        exec['cmd'] = `${exec['cmd']} rsync ${_args.rsync_options}`;
        exec['cmd'] = `${exec['cmd']} ${source} ${target}`;

        // Ejecuta comando rsync
        way.lib.logRunning(`Sync "${_args.env_key}"`);
        await way.lib.exec(exec);
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