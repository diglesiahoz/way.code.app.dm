way.lib.dm.powerOff = async function (_args){
  var _args = way.lib.getArgs('dm.powerOff', _args);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      (async function() {

        // Get containers
        var containers_by_proxy = await way.lib.exec({
          cmd: `docker network inspect dm_proxy | jq .[].Containers | jq "keys" | jq -rc .[]`,
          out: false,
          cast: true
        }).catch((o) => {
          return {};
        });
        containers_by_proxy = containers_by_proxy.buffer;

        // Get tags
        var tags = [];
        for (profileKey of way.map.profileKey) {
          var config = await way.lib.loadConfig({
            key: [profileKey],
            force: true
          }).catch((o) => {
            return {};
          });
          if (typeof config.appsetting !== "undefined" && typeof config.appsetting == "object") {
            if (tags.includes(config.appsetting.tag) == false) {
              tags.push(config.appsetting.tag);
            }
          }
        }

        // Turning off containers
        for (tag of tags) {
          var containers_by_name = await way.lib.exec({
            cmd: `docker ps -a --no-trunc -q --filter name=^/${tag}-`,
            out: false,
            cast: true
          }).catch((o) => {
            return {};
          });
          containers_by_name = containers_by_name.buffer;
          if (containers_by_name.length > 0) {
            way.lib.logRunning(`Turning off "${tag}" services`);
            cmd = `docker stop ${containers_by_name.join(' ')} && docker rm ${containers_by_name.join(' ')}`;
            out = await way.lib.exec({
              cmd: cmd,
              out: false,
              cast: true
            }).catch((o) => {
              return {};
            });
            if (out.code != 0) {
              way.lib.exit(`Error turning off "${tag}" service (${out.buffer.stderr.trim()})`);
            }
            way.lib.clearLogRunning();
          }
        }

        // Turning off "dm_proxy" network
        var networks = await way.lib.exec({
          cmd: `docker network ls --format "{{.Name}}"`,
          out: false,
          cast: true
        }).catch((o) => {
          return {};
        });
        if (networks.buffer.length > 0 && networks.buffer.includes('dm_proxy')) {
          way.lib.logRunning(`Turning off "dm_proxy" network`);
          var out = await way.lib.exec({
            cmd: `docker network disconnect -f dm_proxy ${containers_by_proxy.join(' ')}`,
            out: false,
            cast: true
          }).catch((o) => {
            return {};
          });
          way.lib.clearLogRunning();
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