module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    overrides: [
      {
        // Strip Flow types fra .js filer i node_modules (fx expo-modules-core)
        // .ts/.tsx filer haandteres af babel-preset-expo via @babel/preset-typescript
        test: /\.js$/,
        plugins: [
          ['@babel/plugin-transform-flow-strip-types', { allowDeclareFields: true }],
        ],
      },
    ],
  };
};
