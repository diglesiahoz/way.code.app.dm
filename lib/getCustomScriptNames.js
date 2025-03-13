way.lib.dm.getCustomScriptNames = async function (_args){
  var _args = way.lib.getArgs('dm.getCustomScriptNames', _args);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      (async function() {

        var path = require('path');
        var glob = require("glob");

        var envThis = await way.lib.decode({ data: way.env._this }).catch((o) => { return {} });

        var script_names = [];
        await glob.sync(`${envThis.appsetting.root}/**/custom/sh/*`, {
          dot: true
        }).map(abs_path => {
          if (!path.basename(abs_path).startsWith('.') && path.parse(abs_path).ext == '') {
            script_names.push(path.parse(abs_path).name)
          }
        });

        return resolve({
          args: Object.assign({}, _args),
          attach: {},
          code: 0,
          data: script_names,
        });

      })();
    }, 0); 
  });

}