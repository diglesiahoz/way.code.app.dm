/**
 * Producción: DOCUSAURUS_BASE_URL=/@doc/ (npm run build, nginx).
 * Desarrollo: DOCUSAURUS_BASE_URL=/ (scripts/dev.mjs, docusaurus start).
 * DOCUSAURUS_URL opcional; por defecto http://localhost.
 */
const path = require('path');
const baseUrl = process.env.DOCUSAURUS_BASE_URL || '/@doc/';
const isDevServer = baseUrl === '/';

module.exports = {
  title: 'Docs',
  url: process.env.DOCUSAURUS_URL || 'http://localhost',
  baseUrl,
  trailingSlash: baseUrl !== '/',
  favicon: 'img/logo.svg',
  themeConfig: {
    navbar: {
      title: 'Asistea',
      logo: {
        alt: 'Logo Docs',
        src: 'img/logo.svg',
      },
      items: [],
    },
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
  },
  presets: [
    [
      'classic',
      {
        docs: {
          path: 'md',
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  plugins: [
    [
      require.resolve('@cmfcmf/docusaurus-search-local'),
      {
        indexDocs: true,
        indexBlog: false,
        indexPages: false,
        language: 'es',
      },
    ],
    ...(isDevServer
      ? [path.resolve(__dirname, 'plugins/dev-server-allowed-hosts.js')]
      : []),
  ],
};
