module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    ["@babel/preset-react", { runtime: "automatic" }],
    ["@babel/preset-typescript"]
  ],
  plugins: [
    // Plugin para transformar import.meta en tests
    function () {
      return {
        visitor: {
          MetaProperty(path) {
            if (path.node.meta.name === 'import' && path.node.property.name === 'meta') {
              path.replaceWithSourceString('global.import.meta');
            }
          },
        },
      };
    },
  ],
};
