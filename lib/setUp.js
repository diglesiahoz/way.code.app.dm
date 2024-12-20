way.lib.dm.setUp = async function (_args){
  var _args = way.lib.getArgs('dm.setUp', _args);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      (async function() {

        var path = require('path');


        // Obtiene perfil de configuración
        var envThis = await way.lib.decode({ data: way.env._this }).catch((o) => { return {} });


        if (typeof envThis.appsetting.root === "undefined") {
          way.lib.exit(`Required configuration "appsetting.root" from "${way.env._this._fullname}"`)
        }

        // Establece la ruta para levantar el contenedor
        var up_home = `${envThis.appsetting.root}`;
        var basename = path.basename(envThis.appsetting.root);
        if (basename != ".dm") {
          var up_home = `${envThis.appsetting.root}/.dm`;
        }

        way.var.up_home_root = up_home;
        //console.log(way.var.up_home_root); way.lib.exit()

        return resolve({
          args: Object.assign({}, _args),
          attach: {},
          code: 0,
          data: up_home,
        });

      })();
    }, 0); 
  });
}