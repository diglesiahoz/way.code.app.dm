const { clear } = require('console');

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

        // Establece ruta absoluta de la HOME del usuario si es necesario
        // envThis._root = envThis._root.replace(/^~\//, `${process.env.HOME}/`);
        envThis._root = envThis._root.replace(/^~\//, `${process.env.HOME}/`);

        //console.log(envThis);way.lib.exit();

        // Define variable para desplegar gestor
        if (typeof way.var.deploy_manager === 'undefined') {
          way.var.deploy_manager = true;
        }

        // Carga configuración del entorno
        await way.lib.loadEnv({}).catch((o) => {});


        try {
          const internal_settings_key = Object.keys(envThis).filter(key => key.startsWith("_"));
          internal_settings_key.forEach((setting_key, index) => {
            way.var.loadEnv.unshift(`APPSETTING${setting_key.toUpperCase()}="${envThis[setting_key]}"`);
          });
        } catch (e) { }

        /*
        try {
          if (way.lib.check(envThis.appsetting.wildcard_host)) {
            let proxy_service_www_rule_host = "";
            Object.keys(envThis.appsetting.service).forEach((service_name, index) => {
              envThis.appsetting.wildcard_host.forEach((host, index) => {
                proxy_service_www_rule_host = (!index) ? "Host(`"+envThis._env+"-"+service_name+"."+host+"`)" : proxy_service_www_rule_host + " || Host(`"+envThis._env+"-"+service_name+"."+host+"`)";
                way.var.loadEnv.unshift(`APPSETTING_SERVICE_${service_name.toUpperCase()}_DOMAIN="${envThis._env}-${service_name}.${host}"`);
              });
              way.var.loadEnv.unshift(`APPSETTING_SERVICE_${service_name.toUpperCase()}_HOST="${envThis._tag}-${service_name}"`);
              way.var.loadEnv.unshift(`APPSETTING_PROXY_SERVICE_${service_name.toUpperCase()}_RULE_HOST="${proxy_service_www_rule_host}"`);
            });
          }
        } catch (e) { way.lib.exit(e) }
        */


        way.var.loadEnv.unshift(`APPSETTING_GID="${way.user.gid}"`);
        way.var.loadEnv.unshift(`APPSETTING_UID="${way.user.uid}"`);
        way.var.loadEnv.unshift(`APPSETTING_USER="${way.user.username}"`);

        way.var.loadEnv.unshift(`COMPOSE_PROJECT_NAME="${envThis._tag}"`);


        //console.log(way.var.loadEnv);way.lib.exit()

        
        // Establece variables de entorno
        way.var.env_docker_compose = '{';
        var env_key_parsed = [];
        var to_run = way.var.loadEnv;
        to_run.reverse().sort();
        to_run.forEach(env_var => {
          env_var_key = `${env_var.split('=')[0]}`;
          if (!env_key_parsed.includes(env_var_key) && (/^COMPOSE_PROJECT_NAME/.test(env_var_key) || /^APPSETTING/.test(env_var_key)) ) {
            way.var.env_docker_compose = (way.lib.check(way.var.env_docker_compose)) ? `${way.var.env_docker_compose} ${env_var_key}: "\${${env_var_key}}",` : `${env_var_key}: "\${${env_var_key}}",`;
            way.var.env = (way.lib.check(way.var.env)) ? `${way.var.env}\n${env_var}` : `${env_var}`;
            env_key_parsed.push(env_var_key);
          }
        });
        //console.log(env_key_parsed); way.lib.exit()
        way.var.env_docker_compose = `${ way.var.env_docker_compose.replace(/,$/, "") } }`;
        //console.log(way.var.env_docker_compose);console.log();console.log(way.var.env);way.lib.exit()
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
        if (path.basename(envThis._root) != ".dm" && way.var.deploy_manager == true) {
          var env_target = `${envThis._root}/.dm/.env`;
          if (!fs.existsSync(path.dirname(`${envThis._root}/.dm/.env`))){
            fs.mkdirSync(path.dirname(`${envThis._root}/.dm/.env`), {recursive: true}, err => {});
          }
        } else {
          // SE DEBE DE GESTIONAR DE OTRA FORMA, SI QUEREMOS CLONAR PROYECTO ES UN PROBLEMA LA SIGUIENTE LINEA
          if (fs.existsSync(path.dirname(`${envThis._root}/.dm/.env`))){
            var env_target = `${envThis._root}/.dm/.env`
          } else {
            var env_target = `${envThis._root}/.env`
          }
        }
        if (typeof env_target !== 'undefined') {
          if (!fs.existsSync(path.dirname(env_target))){
            fs.mkdirSync(path.dirname(env_target), {recursive: true}, err => {});
          }
          fs.writeFileSync(env_target, way.var.env);
          way.lib.log({ message: `Environment settings setted into: ${env_target}`, type: "label" });
        }


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
            await glob.sync(`${envThis._root}/**/*`, {
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
              if (fs.existsSync(`${way.root_app}/file/stack/${_args.name}/${relprefix_path}templates/docker-compose/service.${service}.dm.yml`)){
                var service_data = fs.readFileSync(`${way.root_app}/file/stack/${_args.name}/${relprefix_path}templates/docker-compose/service.${service}.dm.yml`, 'utf8');
                service_data = await way.lib.decode({ data: service_data }).catch((o) => { return {} });
                var parsed = '';
                service_data.split(/\n/).forEach(line => {
                  parsed = `${parsed}  ${line}\n`;
                });
                way.var.services_dm = (way.lib.check(way.var.services_dm)) ? `${way.var.services_dm}${parsed}` : `\n${parsed}`;
                (!services.includes(service)) ? services.push(service) : null;
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

          //console.log(`${way.root_app}/file/stack/${_args.name}/**/*`)

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
              if (new RegExp(/^\.dm/,"g").test(rel_path) && way.var.deploy_manager == true) {
                flag_include = true;
              }
              // if (path.basename(envThis._root) == '.dm' && way.var.deploy_manager == true) {
              if (path.basename(envThis._root) == 'dm.proxy' && way.var.deploy_manager == true) {
                flag_include = true;
              }
            }

            if (way.lib.check(way.var.deploy_stack)) {
              for (stack_rel_path of way.var.deploy_stack) {
                if (new RegExp(`^${stack_rel_path}`,"g").test(rel_path)) {
                  flag_include = true;
                  break;
                }
              }
            }

            //console.log(`${flag_include} ${rel_path}`)

            if (flag_include) {

              var target = `${envThis._root}/${rel_path}`;
              var basename = path.basename(abs_path);

              if (/\/docker-compose/.test(rel_path) && path.basename(rel_path) != 'docker-compose.yml' && path.basename(rel_path) != 'docker-compose.dm.yml') {
                continue;
              }

              if (/\/entrypoint\//.test(rel_path)) {
                var entrypoint_filename = path.basename(rel_path, path.extname(rel_path));
                if (!services.some(prefix => entrypoint_filename.startsWith(prefix))) {
                  continue;
                }
              }
              
              var deployed = false;

              if (fs.lstatSync(abs_path).isDirectory()) {
                fs.mkdirSync(target, {recursive: true}, err => {});
                fs.chown(target, way.user.uid, way.user.gid, (error) => { });
                way.lib.log({ message:`Deploy directory: ${target}`, type:`label`});
                deployed = true;
              } else {

                var file_data = fs.readFileSync(abs_path, 'utf8');

                // Establece contenido del fichero desde personalizado.
                /*
                if (/templates\//.test(rel_path)) {
                  let custom_target_path = target.replace(/templates\//, 'custom/');
                  if (fs.existsSync(custom_target_path) && !fs.lstatSync(custom_target_path).isDirectory()){
                    file_data = fs.readFileSync(custom_target_path, 'utf8');
                  }
                }
                */
                
                way.var.extra_commands = '';
                if (new RegExp(`\/dockerfile\/`,"g").test(rel_path)) {
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
                if (fs.existsSync(target)){
                  var current_file_data = fs.readFileSync(target, 'utf8');
                  if (way.lib.getHash(current_file_data) !== way.lib.getHash(data)) {
                    if (_args.force){
                      //way.opt.y = false;
                      var ask_response = await way.lib.ask({
                        message: `Are you sure you want to sync from original? (Custom detected from "${rel_path}")`,
                        exitIfNegative: false
                      });
                      flag_set_file = true;
                      if (!ask_response) {
                        flag_set_file = false;
                      }
                    } else {
                      flag_set_file = false;
                      message = `Custom detected (skip deploy file): ${target}`;
                      message_type = `label`;
                    }
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
                if (path.basename(envThis._root) == '.dm') {
                  rel_paths.push(`${path.basename(envThis._root)}/${abs_path.split(`${way.root_app}/file/stack/${_args.name}/`)[1]}`);
                } else {
                  rel_paths.push(abs_path.split(`${way.root_app}/file/stack/${_args.name}/`)[1]);
                }
              }

            } else {
              // way.lib.log({ message: `Skip deploy: ${rel_path}`, type: "label" });
            }

          }



          //way.lib.exit('INIT!');

          //console.log(rel_paths)



          // Detecta y elimina directorios y ficheros obsoletos en destino
          if (way.var.deploy_manager == true) {
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
                //console.log(path.basename(abs_path), /\/custom\//.test(rel_path_to_check) )
                switch (path.basename(abs_path)) {
                  case '.env':
                  case 'dm--key.pem':
                  case 'dm--cert.pem':
                    var try_to_remove = false;
                    break;
                  default:
                    if (/\/custom\//.test(rel_path_to_check)) {
                      var try_to_remove = false;
                      message = (fs.lstatSync(abs_path).isDirectory()) ? `Skip remove outdated directory: ${abs_path}` : `Skip remove outdated file: ${abs_path}`;
                      way.lib.log({ message: `${message}`, type: "label" });
                    } else {
                      var try_to_remove = true;
                    }
                    break;
                }
                
                if (try_to_remove) {  
                  // message = (fs.lstatSync(abs_path).isDirectory()) ? `Found outdated directory: ${abs_path}` : `Found outdated file: ${abs_path}`;
                  if (_args.force){
                    message = (fs.lstatSync(abs_path).isDirectory()) ? `Removed outdated directory: ${abs_path}` : `Removed outdated file: ${abs_path}`;
                    fs.rmSync(abs_path, { recursive: true, force: true });
                    way.lib.log({ message: `${message}`, type: `warning` });
                  }
                }
              }
            });
          }

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