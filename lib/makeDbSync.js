way.lib.dm.makeDbSync = async function (_args){
  var _args = way.lib.getArgs('dm.makeDbSync', _args);
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

        // Pregunta de control
        await way.lib.dm.checkEnv({
          type: 'sync',
          source_env: `${source_config._env}`,
          source_extra_info: `{${source_config.appsetting.service.db.host}/${source_config.appsetting.service.db.name}}`,
          target_env: `${target_config._env}`,
          target_extra_info: `{${target_config.appsetting.service.db.host}/${target_config.appsetting.service.db.name}}`,
        });

        // Exporta base de datos
        var output = await way.lib.dm.makeDbExport({
          leap_from: source_config.appsetting.service.db.leap_from,
          env_key: source_config._config_name,
          from_service: `${source_config._tag}-db`,
          base_image: source_config.appsetting.service.db.base_image,
          host: source_config.appsetting.service.db.host,
          name: source_config.appsetting.service.db.name,
          user: source_config.appsetting.service.db.user,
          pass: source_config.appsetting.service.db.pass,
          excluded_tables: source_config.appsetting.service.db.conf['db-export']['excluded-tables'],
          backup_db_path: source_config.appsetting.path.backup_db,
        });

        // Lanza evento "before_db_import"
        await way.lib.hookEvent({ 
          config_key: `${target_config._config_name}`,
          event: `before_db_import` 
        });

        // Importa base de datos
        var output = await way.lib.dm.makeDbImport({
          leap_from: target_config.appsetting.service.db.leap_from,
          env_key: target_config._config_name,
          from_service: `${target_config._tag}-db`,
          base_image: target_config.appsetting.service.db.base_image,
          host: target_config.appsetting.service.db.host,
          name: target_config.appsetting.service.db.name,
          user: target_config.appsetting.service.db.user,
          pass: target_config.appsetting.service.db.pass,
          backup_db_path: target_config.appsetting.path.backup_db,
          file: output.data.file
        });

        // Devuelve resultado
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