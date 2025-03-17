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
        await way.lib.loadEnv({}).catch((o) => {});

        way.var.env_dockerfile = `ENV ${way.var.loadEnv.join("\nENV ")}`;
        way.var.env = `${way.var.loadEnv.join("\n")}`;

        way.lib.log({ message: `===========`, type: "label" });
        way.lib.log({ message: `=== ENV ===`, type: "label" });
        way.lib.log({ message: `===========`, type: "label" });
        way.var.env.split(/\n/).forEach(env_var => {
          way.lib.log({ message: `${env_var}`, type: "label" });
        });
        way.lib.log({ message: `===========`, type: "label" });



        // Obtiene comandos extra
        var extra_commands = {};
        for (service of Object.keys(envThis.appsetting.service)) {
          try {
            if (way.lib.check(envThis.appsetting.service[service].extra_commands)) {
              extra_commands[service] = envThis.appsetting.service[service].extra_commands;
            }
          } catch (e) { }
        }
        //console.log(extra_commands);


        // Establece fichero .env
        var basename = path.basename(envThis.appsetting.root);
        if (basename != ".dm") {
          var env_target = `${envThis.appsetting.root}/.dm/.env`;
          if (!fs.existsSync(path.dirname(`${envThis.appsetting.root}/.dm/.env`))){
            fs.mkdirSync(path.dirname(`${envThis.appsetting.root}/.dm/.env`), {recursive: true}, err => {});
          }
        } else {
          var env_target = `${envThis.appsetting.root}/.env`
        }
        //console.log(env_target);
        if (!fs.existsSync(path.dirname(env_target))){
          fs.mkdirSync(path.dirname(env_target), {recursive: true}, err => {});
        }
        fs.writeFileSync(env_target, way.var.env);
        way.lib.log({ message: `Environment settings setted into: ${env_target}`, type: "label" });
        //console.log(way.var.env);way.lib.exit()


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

          // Obtiene todos los ficheros
          rel_paths = [];
          paths = [];
          await glob.sync(`${way.root_app}/file/stack/${_args.name}/**/*`, {
            dot: true,
            ignore: [
              '**/node_modules/**',
              '**/.git/**',
            ],
          }).map(path => {
            paths.push(path);
            if (basename == '.dm') {
              rel_paths.push(`${basename}/${path.split(`${way.root_app}/file/stack/${_args.name}/`)[1]}`);
            } else {
              rel_paths.push(path.split(`${way.root_app}/file/stack/${_args.name}/`)[1]);
            }
          });

          // Despliega todos los ficheros
          for (abs_path of paths) {
            var flag_include = true;
            // Determina si debe de incluir...
            var rel_path = `${abs_path.replace(`${way.root_app}/file/stack/${_args.name}/`,'')}`;
            if (_args.include.length > 0) {
              flag_include = false;
              for (pattern of _args.include) {
                if (new RegExp(`${pattern}`,"g").test(rel_path)) {
                  flag_include = true;
                  break;
                }
              }
            }
            if (!way.lib.check(way.var.deploy_all_stack) || (way.lib.check(way.var.deploy_all_stack) && !way.var.deploy_all_stack) ) {
              flag_include = false;
              if (new RegExp(/^\.dm/,"g").test(rel_path)) {
                flag_include = true;
              }
              if (path.basename(envThis.appsetting.root) == '.dm') {
                flag_include = true;
              }
            }
            if (flag_include) {
              var target = `${envThis.appsetting.root}/${rel_path}`;
              if (fs.lstatSync(abs_path).isDirectory()) {
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
                var file_data = fs.readFileSync(abs_path, 'utf8');
                
                var basename = path.basename(abs_path);
                way.var.extra_commands = '';
                if (new RegExp(`^Dockerfile\.`,"g").test(basename)) {
                  var service = basename.split('.').pop();
                  if (way.lib.check(extra_commands[service]) && extra_commands[service].length > 0) {
                    way.var.extra_commands = `RUN ${extra_commands[service].join("\nRUN ")}`;
                  }
                }

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
                if (flag_set_file) {
                  fs.writeFileSync(target, `${data}`);
                  fs.chown(target, way.user.uid, way.user.gid, (error) => { 
                    // if (!error) {
                    //   console.log('ok file')
                    // } else {
                    //   console.log(error)
                    // }
                  });
                  if (path.extname(target) == ".sh" || /custom\/run\/.*/.test(target)) {
                    fs.chmod(target, 0o764, () => { });
                  }
                  way.lib.log({ message:`Deployed file: ${target}`, type:`label`});
                } else {
                  way.lib.log({ message:`Skip deploy file: ${target} (changes in origin detected)`, type:`warning`});
                }
              }
            } else {
              way.lib.log({ message: `Skip deploy: ${rel_path}`, type: "label" });
            }
          }

          // Detecta y elimina obsoleto en destino
          var base_dir_path = path.dirname(path.dirname(env_target));
          await glob.sync(`${path.dirname(env_target)}/**/*`, {
            dot: true,
            ignore: [
              '**/node_modules/**',
              '**/.git/**',
            ],
          }).map(path => {
            var rel_path_to_check = path.split(`${base_dir_path}/`)[1];
            if (!rel_paths.includes(rel_path_to_check) && fs.existsSync(path) && fs.lstatSync(path).isDirectory()) {
              message = `Found outdated directory: ${path}`;
              if (_args.force){
                fs.rmSync(path, { recursive: true, force: true });
                message = `Removed outdated directory: ${path}`;
              }
              way.lib.log({ message: `${message}`, type: `warning` });
            }
          });

        } else {
          way.lib.log({ message: "Skip deploy files (Stack not found)", type: "label" });
        }



        // way.lib.exit()

        

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