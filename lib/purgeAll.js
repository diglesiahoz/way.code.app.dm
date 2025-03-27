way.lib.dm.purgeAll = async function (_args){
  var _args = way.lib.getArgs('dm.purgeAll', _args);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      (async function() {

        // NETWORKS
        var networks = await way.lib.exec({
          cmd: `docker network ls --format "{{.Name}}"`,
          out: false,
          cast: true
        }).catch((o) => {
          return {};
        });

        for (profileKey of way.map.profileKey) {

          var config = await way.lib.loadConfig({
            key: [profileKey],
            force: true
          }).catch((o) => {
            return {};
          });

          if (typeof config.appsetting !== "undefined" && typeof config.appsetting == "object") {

            // NETWORKS
            var network_counter = 0;
            for (network_name of networks.buffer) {
              var re = new RegExp(`^${config.appsetting.tag}`)
              if (re.test(network_name)) {
                var out = await way.lib.exec({
                  cmd: `docker network inspect ${network_name} | jq .[].Containers | jq "keys" | jq -c .[]`,
                  out: false,
                  cast: true
                }).catch((o) => {
                  return {};
                });
                if (out.buffer.length > 0) {
                  way.lib.log({message: `Disconnecting and removing network: ${network_name}`, type: `label`});
                  for (endpoint of out.buffer) {
                    var out = await way.lib.exec({
                      cmd: `docker network disconnect -f ${network_name} ${endpoint}`,
                      out: false,
                      cast: true
                    }).catch((o) => {
                      return {};
                    });
                  }
                }
                var out = await way.lib.exec({
                  cmd: `docker network rm ${network_name}`,
                  out: false,
                  cast: true
                }).catch((o) => {
                  return {};
                });
                way.lib.log({message: `Disconnected and removed network: ${network_name}`, type: `success`})
                network_counter++;
              }
            }
            if (!network_counter) {
              //way.lib.log({message: `No networks detected`, type: `success`});
            }

            // CONTAINERS
            var container_counter = 0;
            var filter = ``;
            if (!way.opt.all) {
              filter = `--filter name=^/${config.appsetting.tag}`;
            }
            var out = await way.lib.exec({
              cmd: `docker ps ${filter} -qa`,
              out: false,
              cast: true
            }).catch((o) => {
              return {};
            });
            if (!out.buffer.length) {
              // way.lib.log({message: `No containers detected`, type: `success`});
            } else {
              for (container_id of out.buffer) {
                var out = await way.lib.exec({
                  cmd: `docker inspect ${container_id} --format "{{.Name}}"`,
                  out: false,
                  cast: true
                }).catch((o) => {
                  return {};
                });
                var container_name = out.buffer[0].replace(/\//,'');
                way.lib.log({message: `Stopping and removing container: ${container_name} (${container_id})`, type: `label`});
                var out = await way.lib.exec({
                  cmd: `docker stop ${container_id}`,
                  out: false,
                  cast: true
                }).catch((o) => {
                  return {};
                });
                var out = await way.lib.exec({
                  cmd: `docker rm -v -f ${container_id}`,
                  out: false,
                  cast: true
                }).catch((o) => {
                  return {};
                });
                way.lib.log({message: `Stopped and removed container: ${container_name} (${container_id})`, type: `success`});

                container_counter++;
              }
            }

          }
          
        }

        way.lib.log({message: `Done!`, type: `success`});

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