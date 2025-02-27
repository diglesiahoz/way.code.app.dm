way.lib.dm.loadRunEnv = async function (_args){
  var _args = way.lib.getArgs('dm.loadRunEnv', _args);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      (async function() {

        await way.lib.loadEnv({}).catch((o) => {});

        var extra = [];
        extra.push(`WAY_EXEC="${way.exec}"`);

        const env = way.var.loadEnv.concat(extra);
        way.var.env = env.join('; export ');

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