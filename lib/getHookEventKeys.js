way.lib.dm.getHookEventKeys = async function (_args){
  var _args = way.lib.getArgs('dm.getHookEventKeys', _args);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      (async function() {

        var envThis = await way.lib.decode({ data: way.env._this }).catch((o) => { return {} });

        var hook_event_keys = [];
        try {
          var hookEvent = eval(`envThis.hook.event`);
          var hook_event_proc_keys = Object.keys(hookEvent);
          if (hook_event_proc_keys.includes(way.proc.name)) {
            var hook_event = eval(`envThis.hook.event["${way.proc.name}"]`);
            hook_event_keys = Object.keys(hook_event);
          }
        } catch (e) {}

        if (!hook_event_keys.length) {
          way.lib.exit(`No hook implemented for "${way.proc.name}" procedure from the "${envThis._config_name}" profile`);
        }

        return resolve({
          args: Object.assign({}, _args),
          attach: {},
          code: 0,
          data: hook_event_keys,
        });

      })();
    }, 0); 
  });

}