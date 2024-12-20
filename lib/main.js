way.lib.dm.main = async function (_args){
  var _args = way.lib.getArgs('dm.main', _args);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      (async function() {
        return resolve({
          args: Object.assign({}, _args),
          attach: {},
          code: 0,
          data: `Executed from procedure main function`,
        });
      })();
    }, 0); 
  });
}