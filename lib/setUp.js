way.lib.dm.setUp = async function (_args){
  var _args = way.lib.getArgs('dm.setUp', _args);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      (async function() {

        var fs = require('fs');
        var path = require('path');

        // Obtiene perfil de configuración
        var envThis = await way.lib.decode({ data: way.env._this }).catch((o) => { return {} });

        // Establece la ruta para levantar el contenedor...
        var up_home = `${envThis._root}`;
        var basename = path.basename(envThis._root);
        var parent_dir_name = envThis._root;
        if (basename != ".dm") {
          //var up_home = `${envThis._root}/.dm`;
          envThis._root = `${envThis._root}/.dm`;
        }
        way.var.setup_home_root = envThis._root;
        //console.log(way.var.setup_home_root);

        // Establece comando "compose" a ejecutar...
        // way.var.setup_compose_cmd = `export COMPOSE_PROJECT_NAME=(({origin}._tag)); export APPSETTING_UID=(({}.user.uid)); export APPSETTING_GID=(({}.user.gid)); export APPSETTING_USER=(({}.user.username)); export APPSETTING_ENV=(({origin}._env));`;
        way.var.setup_compose_cmd = ``;
        way.var.setup_compose_cmd = `${way.var.setup_compose_cmd} docker compose --env-file .env`;
        if (fs.existsSync(`${envThis._root}/docker-compose.dm.yml`)){
          way.var.setup_compose_cmd = `${way.var.setup_compose_cmd} -f docker-compose.dm.yml`;
        }
        var extra_opt = '-d';
        if (envThis._tag != 'dmproxy' && (way.lib.check(way.opt.keep) && way.opt.keep)) {
          extra_opt = '';
        }
        way.var.setup_compose_cmd = `[ ! -f ../.env ] && touch ../.env; export COMPOSE_BAKE=true;${way.var.setup_compose_cmd} up --build --force-recreate --remove-orphans ${extra_opt}`;
        way.var.setup_compose_cmd = await way.lib.decode({ data: way.var.setup_compose_cmd }).catch((o) => { return {} });
        
        //console.log(way.var.setup_compose_cmd);way.lib.exit()

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