const tsconfigPaths = require('rollup-plugin-tsconfig-paths');

module.exports = (config) => {
  return {
    ...config,
    plugins: [
      tsconfigPaths({
        tsConfigPath: 'libs/rapid-cmi5/tsconfig.lib.json',
      }),
      ...config.plugins,
    ],
  };
};