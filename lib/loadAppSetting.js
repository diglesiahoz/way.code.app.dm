way.lib.dm.loadAppSetting = async function (_args){
  var _args = way.lib.getArgs('dm.loadAppSetting', _args);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      (async function() {

        var fs = require('fs');
        var path = require('path');
        var jsonToEnv = require('json-to-env2'); // https://github.com/nlapshin/json-to-env


        // Obtiene perfil de configuración
        var envThis = await way.lib.decode({ data: way.env._this }).catch((o) => { return {} });
        if (typeof envThis.appsetting.root === "undefined") {
          way.lib.exit(`Required configuration "appsetting.root" from "${way.env._this._fullname}"`)
        }

        var _env = envThis._env;

        var envThis = envThis.appsetting;

        //console.log(envThis)
        
        // Añade variables a dockerfile
        //var env_dockerfile = "";
        if (typeof envThis['env_dockerfile'] !== "undefined") {
          if (Array.isArray(envThis['env_dockerfile'])) {
            for (l of envThis['env_dockerfile']) {
              if (typeof env_dockerfile === "undefined") {
                var env_dockerfile = `ENV ${l}`;
              } else {
                env_dockerfile = `${env_dockerfile}\nENV ${l}`;
              }
            }
            delete envThis['env_dockerfile'];
          } else {
            way.lib.exit('La propiedad env_dockerfile debe de ser array de valores')
          }
        }

        //console.log(env_dockerfile)

        //way.lib.exit()

        //envThis['uid'] = way.user.uid;
        //envThis['gid'] = way.user.gid;
        //envThis['username'] = way.user.username;

        var basename = path.basename(envThis.root);
        if (basename != ".dm") {
          var env_target = `${envThis.root}/.dm/.env`;
          if (!fs.existsSync(path.dirname(`${envThis.root}/.dm/.env`))){
            fs.mkdirSync(path.dirname(`${envThis.root}/.dm/.env`), {recursive: true}, err => {});
          }
        } else {
          var env_target = `${envThis.root}/.env`
        }


        
        const env = jsonToEnv(envThis.service, {});
        // console.log(env)
        // way.lib.exit()

        // console.log(envThis)
        // way.lib.exit()


        var env_data = "";
        // var env_data = `COMPOSE_PROJECT_NAME=dm_${envThis.tag}`;
        // env_data = `${env_data}\nAPPSETTING_UID=${way.user.uid}`;
        // env_data = `${env_data}\nAPPSETTING_GID=${way.user.gid}`;

        var env_lines = env.split(/\r?\n|\r|\n/g);
        env_lines = env_lines.sort()
        for (l of env_lines) {
          if (l !== "") {
            if (l.split('=').length < 3) {
              env_data = (env_data === "") ? `APPSETTING_SERVICE_${l}` : `${env_data}\nAPPSETTING_SERVICE_${l}`;
              if (typeof env_dockerfile === "undefined") {
                var env_dockerfile = `ENV APPSETTING_SERVICE_${l}`;
              } else {
                env_dockerfile = `${env_dockerfile}\nENV APPSETTING_SERVICE_${l}`;
              } 
            }
          }
        }


        env_dockerfile = `${env_dockerfile}\nENV APPSETTING_ENV=${_env}`;

        way.var.env_dockerfile = env_dockerfile;

        
        
        way.lib.log({ message: `==============\nenv dockerfile\n==============\n${way.var.env_dockerfile}`, type: "label" });
        way.lib.log({ message: `===\nenv\n===\n${env_data}`, type: "label" });
        //way.lib.exit()


        if (!fs.existsSync(path.dirname(env_target))){
          fs.mkdirSync(path.dirname(env_target), {recursive: true}, err => {});
        }
        fs.writeFileSync(env_target, env_data);
        way.lib.log({ message: `Env file setted into: ${env_target}`, type: "label" });

        //way.lib.exit()


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