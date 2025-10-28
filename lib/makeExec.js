way.lib.dm.makeExec = async function (_args){
  var _args = way.lib.getArgs('dm.makeExec', _args);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      (async function() {

        // Carga perfil de configuración
        var envThis = await way.lib.decode({ data: way.env._this }).catch((o) => { return {} });

        var require_to_ask = false;

        if (!way.lib.check(way.args.arg1)) {
          _args.cmd = `/bin/bash`;
        } else {
          let regex = new RegExp(`^(?:-\\S+\\s+)*${way.args.arg1}`);
          _args.cmd = _args.cmd.replace(regex, way.args.arg1);
        }

        // Determina que comandos se debe de solicitar confirmación
        const cmd_to_check = [ "rm", "mv", "dd", "chmod", "chown", "mkfs", "shutdown" ];
        if (cmd_to_check.some(danger => _args.cmd.split(" ").includes(danger))) {
          require_to_ask = true;
        }
        if (envThis._env == 'prod') {
          require_to_ask = true;
        }

        // Pregunta de control si no ejecuta /bin/bash
        if (_args.cmd != '/bin/bash') {
          if (require_to_ask) {
            if (!way.opt.d) {
              way.opt.y = false;
            }
            await way.lib.dm.checkEnv({
              type: 'exec',
              source_env: `${envThis._env}`,
              source_extra_info: `{${_args.cmd}}`,
              target_env: `${envThis._env}`,
              target_extra_info: `{${_args.cmd}}`,
            });
          }
        }

        // Inicializa ejecución
        var exec = {};
        exec['out'] = true;
        if (envThis._env == 'local') {
          exec['cmd'] = `docker exec -it --user ${way.user.username} ${envThis._parent_key}-www ${_args.cmd}`;
        } else {
          if (!way.lib.check(_args.access)) {
            way.lib.exit(`Non-local environment requires implementing server access from configuration profile`);
          }
          exec = Object.assign(exec, _args.access);
          exec['cmd'] = `${_args.cmd}`;
        }

        // Ejecuta comando
        await way.lib.exec(exec);
        
        // Resuelve
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