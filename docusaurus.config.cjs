const path = require("node:path");

const config = {
  title: "Manual SAAC",
  tagline: "Documentacion funcional del frontend",
  favicon: "Images/IsotipoSAAC.svg",

  url: "https://saac.local",
  baseUrl: "/",

  organizationName: "saac",
  projectName: "saac-frontend",

  onBrokenLinks: "throw",
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },

  i18n: {
    defaultLocale: "es",
    locales: ["es"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          path: "Docs/manual",
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.cjs"),
        },
        blog: false,
        pages: false,
        theme: {
          customCss: require.resolve("./src/docs/custom.css"),
        },
      },
    ],
  ],

  plugins: [
    function generatedModulesCompatPlugin() {
      return {
        name: "generated-modules-compat-plugin",
        configureWebpack() {
          return {
            module: {
              rules: [
                {
                  test: /[\\\/]\.docusaurus[\\\/].+\.js$/,
                  type: "javascript/auto",
                },
              ],
            },
          };
        },
      };
    },
  ],

  themeConfig: {
    navbar: {
      title: "Manual SAAC",
      logo: {
        alt: "SAAC",
        src: "Images/IsotipoSAAC.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "manualSidebar",
          position: "left",
          label: "Modulos",
        },
        {
          href: "https://github.com/",
          label: "Repositorio",
          position: "right",
        },
      ],
    },
    footer: {
      style: "light",
      copyright: "SAAC - Manual funcional del frontend",
    },
    colorMode: {
      defaultMode: "light",
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
  },
};

module.exports = config;
