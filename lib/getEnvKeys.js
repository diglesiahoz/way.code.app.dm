way.lib.dm.getEnvKeys = async function (_args){
  var _args = way.lib.getArgs('dm.getEnvKeys', _args);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      (async function() {

        var envThis = await way.lib.decode({ data: way.env._this }).catch((o) => { return {} });
        //console.log(`To check: ${envThis._parent_key}`);

        let profile_keys = way.map.profileKey.filter((element) => {
          return new RegExp(`^@${envThis._parent_key}\..*`,"g").test(element);
        });
        //console.log(profile_keys)

        var envs = {};

        var tmp_envs = [];
        for (profile_key of profile_keys) {
          var env_key = profile_key.replace(new RegExp(`^@${envThis._parent_key}\.`,"g"), '');
          if (!tmp_envs.includes(env_key)) {
            tmp_envs.push(env_key);
          }
        };
        //console.log(tmp_envs);

        var env_keys = [];
        for (env_key of tmp_envs) {
          for (env_key_target of tmp_envs) {
            if (
              /prod/.test(env_key_target) || 
              /pro/.test(env_key_target) || 
              /live/.test(env_key_target) || 
              env_key == env_key_target
              ) {
              continue;
            };

            if (!new RegExp(`local$`,"g").test(env_key) && !new RegExp(`local$`,"g").test(env_key_target)) {
              // SKIP
            } else {

              //console.log(`@${envThis._parent_key}.${env_key}`, `@${envThis._parent_key}.${env_key_target}`);
              
              var to_load = [];
              if (!way.lib.check(envs[`@${envThis._parent_key}.${env_key}`])) {
                to_load.push(`@${envThis._parent_key}.${env_key}`);
              }
              if (!way.lib.check(envs[`@${envThis._parent_key}.${env_key_target}`])) {
                to_load.push(`@${envThis._parent_key}.${env_key_target}`);
              }
              if (to_load.length > 0) {
                for (config_to_load of to_load) {
                  var config = await way.lib.loadConfig({
                    key: [`${config_to_load}`],
                    force: true
                  }).catch((o) => {
                    return {};
                  }); 
                  envs[`${config_to_load}`] = config;
                }
              }

              env_keys.push(`${env_key}-to-${env_key_target}`);
              //console.log(envs, `@${env_key}`)

              // Comprueba etiquetas
              var source_tags = envs[`@${envThis._parent_key}.${env_key}`].tags;
              var target_tags = envs[`@${envThis._parent_key}.${env_key_target}`].tags;
              if (way.lib.check(source_tags) && way.lib.check(target_tags)) {
                var source_key_tags = Object.keys(source_tags);
                var target_key_tags = Object.keys(target_tags);
                var common_tags = source_key_tags.filter(value => target_key_tags.includes(value));
                if (common_tags.length > 0) {
                  //console.log(`@${envThis._parent_key}.${env_key}`, source_tags);
                  //console.log(`@${envThis._parent_key}.${env_key_target}`, target_tags)
                  //console.log(common_tags)
                  common_tags.forEach(tag_name =>{
                    env_keys.push(`${env_key}-to-${env_key_target}:${tag_name}`);
                  });
                }
              }

            }
          }
        }
        //console.log(env_keys)
        //console.log(envs);

        //way.lib.exit()

        return resolve({
          args: Object.assign({}, _args),
          attach: {},
          code: 0,
          data: env_keys,
        });

      })();
    }, 0); 
  });

}