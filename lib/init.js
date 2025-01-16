way.lib.dm.init = async function (_args){
  var _args = way.lib.getArgs('dm.init', _args);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      (async function() {

        // console.log(_args)

        var fs = require('fs');
        var path = require('path');
        var glob = require("glob");

        // Obtiene perfil de configuración
        var envThis = await way.lib.decode({ data: way.env._this }).catch((o) => { return {} });
        if (typeof envThis.appsetting.root === "undefined") {
          way.lib.exit(`Required configuration "appsetting.root" from "${way.env._this._fullname}"`)
        }


        // Carga configuración del entorno
        await way.lib.dm.loadAppSetting({}).catch((o) => {
          return {};
        });

        // Determina si existe el stack
        var app_name_root = way.app_name_root;
        if (way.app_name_root != way.proc.name.split('.')[0]) {
          app_name_root = way.proc.name.split('.')[0];
        }
        var stack_found = false;
        for (key of Object.keys(way.map.file)) {
          var re = new RegExp(`app\\.${app_name_root}\\.stack\\.${_args.name}\\.`, "i");
          if (re.test(key)) {
            stack_found = true;
          }
        }
        

        if (_args.name !== "" && stack_found) {

          // Elimina todos los ficheros
          if (_args.remove_all) {
            await glob.sync(`${envThis.appsetting.root}/**/*`, {
              dot: true,
            }).map(path => {
              fs.rmSync(`${path}`, { recursive: true, force: true });
            });
          }

          //way.lib.exit()

          // Obtiene todos los ficheros
          paths = [];
          await glob.sync(`${way.root_app}/file/stack/${_args.name}/**/*`, {
            dot: true,
            ignore: [
              '**/node_modules/**',
              '**/.git/**',
            ],
          }).map(path => {
            paths.push(path);
          });

          //console.log(paths)
          //way.lib.exit()

          // Despliega todos los ficheros
          for (path of paths) {
            
            var flag_include = true;

            // Determina si debe de incluir...
            var rel_path = `${path.replace(`${way.root_app}/file/stack/${_args.name}/`,'')}`;
            if (_args.include.length > 0) {
              flag_include = false;
              for (pattern of _args.include) {
                if (new RegExp(`${pattern}`,"g").test(rel_path)) {
                  flag_include = true;
                  break;
                }
              }
            }

            if (flag_include) {

              var target = `${envThis.appsetting.root}/${rel_path}`;

              if (fs.lstatSync(path).isDirectory()) {
                if (!fs.existsSync(target)){
                  fs.mkdirSync(target, {recursive: true}, err => {});
                  fs.chown(target, way.user.uid, way.user.gid, (error) => { 
                    // if (!error) {
                    //   console.log('ok dir')
                    // } else {
                    //   console.log(error)
                    // }
                  });
                  way.lib.log({ message:`Deployed directory: ${target}`, type:`label`});
                }
              } else {

                var file_data = fs.readFileSync(path, 'utf8');
                var data = await way.lib.decode({
                  data: file_data,
                  throwException: [ "simple", "global", "map" ],
                  gData: envThis,
                  showWarn: false
                });

                flag_set_file = true;

                if (fs.existsSync(target) && !_args.force){
                  var current_file_data = fs.readFileSync(target, 'utf8');
                  if (way.lib.getHash(current_file_data) !== way.lib.getHash(file_data)) {
                    flag_set_file = false;
                  }
                }

                //console.log(way.user)

                if (flag_set_file) {
                  fs.writeFileSync(target, `${data}`);
                  fs.chown(target, way.user.uid, way.user.gid, (error) => { 
                    // if (!error) {
                    //   console.log('ok file')
                    // } else {
                    //   console.log(error)
                    // }
                  });
                  way.lib.log({ message:`Deployed file: ${target}`, type:`label`});
                } else {
                  way.lib.log({ message:`Skip deploy file: ${target} (changes in origin detected)`, type:`warning`});
                }
              }

            }
          }

        } else {
          way.lib.log({ message: "Skip deploy files (Stack not found)", type: "label" });
        }

        //way.lib.exit()

        // Devuelve standar
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