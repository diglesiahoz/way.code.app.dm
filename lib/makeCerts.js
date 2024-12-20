way.lib.dm.makeCerts = async function (_args){
  var _args = way.lib.getArgs('dm.makeCerts', _args);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      (async function() {

        // Obtiene todos los dominios establecidos en perfiles de configuración
        var hosts = [];
        for (config_key of Object.keys(way.map.config)) {
          if (/^@/.test(config_key)) {
            var config = await way.lib.loadConfig({
              key: [config_key],
              force: true
            }).catch((o) => {
              return {};
            });
            if (typeof config['appsetting'] !== "undefined") {
              if (typeof config['appsetting']['wildcard_host'] !== "undefined") {
                hosts = hosts.concat(config['appsetting']['wildcard_host']);
              }
            }
          }
        }

        // Elimina duplicados
        hosts = hosts.filter(function(item, pos) {
          return hosts.indexOf(item) == pos;
        });

        // Establece cadena de todos los dominios
        let hosts_string = '';
        for (host of hosts) {
          hosts_string += `"${host}" `
          hosts_string += `"*.${host}" `
        }

        // Carga configuración local del proxy
        var proxy_config = await way.lib.loadConfig({
          key: ['@dm.proxy.local'],
          force: true
        }).catch((o) => {
          return {};
        });

        // Crea certificado global para todos los dominios
        let out = await way.lib.exec({
          cmd: `mkcert -install && mkcert -cert-file ${proxy_config._pwd}/certs/dm--cert.pem -key-file ${proxy_config._pwd}/certs/dm--key.pem ${hosts_string}`,
          out: false
        }).catch((o) => {
          return {};
        });
        
        //console.log(out.buffer)
        
        return resolve({
          args: Object.assign({}, _args),
          attach: {},
          code: 0,
          data: out.buffer,
        });
      })();
    }, 0); 
  });
}