way.lib.dm.getRunCommands = async function (_args){
  var _args = way.lib.getArgs('dm.getRunCommands', _args);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      (async function() {

        var fs = require('fs');
        var path = require('path');
        var glob = require("glob");

        var envThis = await way.lib.decode({ data: way.env._this }).catch((o) => { return {} });

        var runs = [];
        await glob.sync(`${envThis.appsetting.root}/**/custom/run/*`, {
          dot: true
        }).map(abs_path => {
          if (!path.basename(abs_path).startsWith('.') && path.parse(abs_path).ext == '') {
            runs.push(path.parse(abs_path).name)
          }
        });

        return resolve({
          args: Object.assign({}, _args),
          attach: {},
          code: 0,
          data: runs,
        });

      })();
    }, 0); 
  });

}