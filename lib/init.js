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
        if (Object.keys(envThis).length == 0) {
          way.lib.exit(`Not found envThis`);
        }
        if (typeof envThis.appsetting.root === "undefined") {
          way.lib.exit(`Required configuration "appsetting.root" from "${way.env._this._fullname}"`)
        }

        // Establece ruta absoluta de la HOME del usuario si es necesario
        envThis.appsetting.root = envThis.appsetting.root.replace(/^~\//, `${process.env.HOME}/`);


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
        //console.log(extra_commands);way.lib.exit()


        // Establece fichero .env
        if (path.basename(envThis.appsetting.root) != ".dm") {
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

          // Monta servicios
          var services = [];
          for (service of Object.keys(envThis.appsetting.service)) {
            try {
              var relprefix_path = '.dm/'
              if (path.basename(envThis.appsetting.root) == '.dm') {
                relprefix_path = ''
              }
              if (fs.existsSync(`${way.root_app}/file/stack/${_args.name}/${relprefix_path}templates/docker-compose/service.${service}.yml`)){
                var service_data = fs.readFileSync(`${way.root_app}/file/stack/${_args.name}/${relprefix_path}templates/docker-compose/service.${service}.yml`, 'utf8');
                service_data = await way.lib.decode({ data: service_data }).catch((o) => { return {} });
                var parsed = '';
                service_data.split(/\n/).forEach(line => {
                  parsed = `${parsed}  ${line}\n`;
                });
                way.var.services = (way.lib.check(way.var.services)) ? `${way.var.services}${parsed}` : `\n${parsed}`;
                services.push(service);
              }
              if (fs.existsSync(`${way.root_app}/file/stack/${_args.name}/${relprefix_path}templates/docker-compose/volume.${service}.yml`)){
                var volume_data = fs.readFileSync(`${way.root_app}/file/stack/${_args.name}/${relprefix_path}templates/docker-compose/volume.${service}.yml`, 'utf8');
                volume_data = await way.lib.decode({ data: volume_data }).catch((o) => { return {} });
                var parsed = '';
                volume_data.split(/\n/).forEach(line => {
                  parsed = `${parsed}  ${line}\n`;
                });
                way.var.volumes = (way.lib.check(way.var.volumes)) ? `${way.var.volumes}${parsed}` : `\n${parsed}`;
              }
            } catch (e) { way.lib.exit(e); }
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
          }).map(abs_path => {
            paths.push(abs_path);
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
              var basename = path.basename(abs_path);


              if (/\/docker-compose/.test(rel_path) && path.basename(rel_path) != 'docker-compose.yml') {
                continue;
              }
              
              var deployed = false;

              if (fs.lstatSync(abs_path).isDirectory()) {
                fs.mkdirSync(target, {recursive: true}, err => {});
                fs.chown(target, way.user.uid, way.user.gid, (error) => { });
                way.lib.log({ message:`Deploy directory: ${target}`, type:`label`});
                deployed = true;
              } else {
                var file_data = fs.readFileSync(abs_path, 'utf8');
                
                way.var.extra_commands = '';
                if (new RegExp(`^dockerfile\.`,"g").test(basename)) {
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

                var flag_set_file = true;
                var message = '';
                var message_type = '';
                if (fs.existsSync(target) && !_args.force){
                  var current_file_data = fs.readFileSync(target, 'utf8');
                  if (way.lib.getHash(current_file_data) !== way.lib.getHash(file_data)) {
                    flag_set_file = false;
                    message = `Skip deploy file: ${target} (changes in origin detected)`;
                    message_type = `warning`;
                  }
                }
                if (/\/dockerfile/.test(rel_path) && !services.includes(path.basename(rel_path))) {
                  flag_set_file = false;
                  // message = `Skip deploy file: ${target} (no service found in configuration)`;
                  // message_type = `label`;
                }

                if (/webserver\./.test(basename) && services.includes('www')) {
                  if (!new RegExp(`webserver\.${envThis.appsetting.service.www.webserver}`,"g").test(basename) && services.includes('www')) {
                    flag_set_file = false;
                  }
                }

                if (flag_set_file) {
                  fs.writeFileSync(target, `${data}`);
                  fs.chown(target, way.user.uid, way.user.gid, (error) => { });
                  if (path.extname(target) == ".sh" || /custom\/run\/.*/.test(target)) {
                    fs.chmod(target, 0o764, () => { });
                  }
                  way.lib.log({ message:`Deploy file: ${target}`, type:`label`});
                  deployed = true;
                } else {
                  way.lib.log({ message: message, type: message_type});
                }
              }


              if (deployed) {
                if (path.basename(envThis.appsetting.root) == '.dm') {
                  rel_paths.push(`${path.basename(envThis.appsetting.root)}/${abs_path.split(`${way.root_app}/file/stack/${_args.name}/`)[1]}`);
                } else {
                  rel_paths.push(abs_path.split(`${way.root_app}/file/stack/${_args.name}/`)[1]);
                }
              }

            } else {
              // way.lib.log({ message: `Skip deploy: ${rel_path}`, type: "label" });
            }

          }



          // way.lib.exit('INIT!');

          // console.log(rel_paths)



          // Detecta y elimina directorios y ficheros obsoletos en destino
          var base_dir_path = path.dirname(path.dirname(env_target));
          await glob.sync(`${path.dirname(env_target)}/**/*`, {
            dot: true,
            ignore: [
              '**/node_modules/**',
              '**/.git/**',
            ],
          }).map(abs_path => {
            var rel_path_to_check = abs_path.split(`${base_dir_path}/`)[1];
            if (!rel_paths.includes(rel_path_to_check) && fs.existsSync(abs_path)) {
              //console.log(path.basename(abs_path))
              switch (path.basename(abs_path)) {
                case '.env':
                case 'dm--key.pem':
                case 'dm--cert.pem':
                  var try_to_remove = false;
                  break;
                default:
                  var try_to_remove = true;
                  break;
              }
              if (try_to_remove) {  
                message = (fs.lstatSync(abs_path).isDirectory()) ? `Found outdated directory: ${abs_path}` : `Found outdated file: ${abs_path}`;
                if (_args.force){
                  message = (fs.lstatSync(abs_path).isDirectory()) ? `Removed outdated directory: ${abs_path}` : `Removed outdated file: ${abs_path}`;
                  fs.rmSync(abs_path, { recursive: true, force: true });
                }
                way.lib.log({ message: `${message}`, type: `warning` });
              }
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