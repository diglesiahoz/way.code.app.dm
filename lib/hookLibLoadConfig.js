way.lib.dm.hookLibLoadConfig = async function (_args){
  var _args = way.lib.getArgs('dm.hookLibLoadConfig', _args);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      (async function() {

        let config = _args.config;

        /*
        try {
          config.appsetting["gid"] = `${way.user.gid}`;
          config.appsetting["uid"] = `${way.user.uid}`;
          config.appsetting["user"] = `${way.user.username}`;
        } catch (e) { way.lib.exit(e) }
        
        try {
          const internal_settings_key = Object.keys(config).filter(key => key.startsWith("_"));
          internal_settings_key.forEach((setting_key, index) => {
            config.appsetting[`${setting_key.replace("_", "")}`] = `${config[setting_key]}`;
          });
        } catch (e) { way.lib.exit(e) }
        */

        try {
          if (way.lib.check(config.appsetting.wildcard_host)) {

            config.appsetting.proxy = {};
            config.appsetting.proxy.service = {};

            let proxy_service_www_rule_host = "";

            Object.keys(config.appsetting.service).forEach((service_name, index) => {
              config.appsetting.wildcard_host.forEach((host, index) => {
                proxy_service_www_rule_host = (!index) ? "Host(`"+config._env+"-"+service_name+"."+host+"`)" : proxy_service_www_rule_host + " || Host(`"+config._env+"-"+service_name+"."+host+"`)";
                config.appsetting.service[service_name]["domain"] = `${config._env}-${service_name}.${host}`;
              });
              config.appsetting.service[service_name]["host"] = `${config._tag}-${service_name}`;
              config.appsetting.proxy.service[service_name] = {};
              config.appsetting.proxy.service[service_name]["rule"] = {};
              config.appsetting.proxy.service[service_name]["rule"]["host"] = `${proxy_service_www_rule_host}`;
            });

          }
        } catch (e) { 
          // way.lib.exit(e) 
        }

        return resolve({
          args: Object.assign({}, _args),
          attach: {},
          code: 0,
          data: config,
        });

      })();
    }, 0); 
  });
}