/**
 * Solo desarrollo: permite cualquier Host en webpack-dev-server (proxy / Traefik).
 * @returns {import('@docusaurus/types').Plugin}
 */
module.exports = function devServerAllowedHostsPlugin() {
  return {
    name: 'dev-server-allowed-hosts',
    configureWebpack(_config, isServer, utils = {}) {
      if (!utils.isDev || isServer) {
        return {};
      }
      return {
        devServer: {
          allowedHosts: 'all',
        },
      };
    },
  };
};
