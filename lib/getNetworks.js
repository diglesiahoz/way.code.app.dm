way.lib.dm.getNetworks = async function (_args){
  var _args = way.lib.getArgs('dm.getNetworks', _args);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      (async function() {

        var out = await way.lib.exec({ 
          cmd: `docker network ls | tail -n +2 | awk "{ print \\$2 }"`, 
          out: false, 
          cast: true 
        }).catch((o) => {
          return {};
        });

        var networks = [];
        for (net of out.buffer) {
          let out = await way.lib.exec({ 
            cmd: `docker network inspect ${net} | jq -r ".[].IPAM.Config[].Subnet"`, 
            out: false
          }).catch((o) => {
            return {};
          });
          if (typeof out.buffer === 'string') {
            networks[net] = out.buffer.trim()
          }
        }

        way.lib.toCLI({ 
          data: networks,
          color: "white",
          config: {
            columns: {
              "4": {
                width: 20,
                wrapWord: true
              }
            }
          }
        });

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