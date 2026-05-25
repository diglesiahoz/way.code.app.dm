// Dev (contenedor doc, puerto 3000): DOCUSAURUS_BASE_URL=/ via entrypoint/doc.sh
// Build servido por nginx en www: DOCUSAURUS_BASE_URL=/@doc/
const baseUrl = process.env.DOCUSAURUS_BASE_URL || '/@doc/';

module.exports = {
  title: 'Docs',
  url: 'http://localhost',
  baseUrl,
  trailingSlash: baseUrl !== '/',
  favicon: 'img/logo.svg',
  themeConfig: {
    navbar: {
      title: '((_name))',
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
  ],
};