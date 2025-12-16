way.lib.dm.makeSonarScan = async function (_args){
  var _args = way.lib.getArgs('dm.makeSonarScan', _args);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      (async function() {

        // Obtiene perfil de configuración
        var envThis = await way.lib.decode({ data: way.env._this }).catch((o) => { return {} });

        // Inicializa resultado de análisis
        const token = _args.token;
        const exec_signature = `docker exec -it --user ${way.user.username} ${envThis.appsetting.service.www.host}`;

        try {
          let services = Object.keys(envThis.appsetting.service);
          if (services.includes('sonar') && services.includes('www')) {
            // Establece propiedades del proyecto
            let project_settings_signature = '';
            for (project_setting of _args.project_settings) {
              project_settings_signature = (way.lib.check(project_settings_signature)) ? `${project_settings_signature} -D${project_setting}` : `-D${project_setting}`;
            }
            project_settings_signature = `${project_settings_signature} -Dsonar.token=${token}`;
            // Comprueba si está establecido token
            if (way.lib.check(token)) {
              // Analiza proyecto
              var exec = {};
              exec['out'] = false;
              exec['cmd'] = `${exec_signature} sonar-scanner ${project_settings_signature}`;
              way.lib.logRunning(`Running sonar scanner`);
              var output = await way.lib.exec(exec);
              way.lib.clearLogRunning();
              // Muestra el resultado del análisis
              scan_result = output.buffer;
              if (way.lib.check(scan_result)) {
                console.log(scan_result);
              }
            } else {
              way.lib.log({ message: `Token not found`, type: `warning` });
            }
          } else {
            way.lib.log({ message: `Requerido servicio sonar`, type: `warning`});
          }
        } catch (e) { console.log(e) }
        
        return resolve({
          args: Object.assign({}, _args),
          attach: {},
          code: 0,
          data: scan_result,
        });

      })();
    }, 0); 
  });
}