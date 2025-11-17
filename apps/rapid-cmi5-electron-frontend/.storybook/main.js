const rootMain = require('../../../.storybook/main');

module.exports = {
  ...rootMain,
  stories: ['../src/app/**/*.mdx', '../src/app/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-interactions',
    ...rootMain.addons,
    '@nx/react/plugins/storybook',
  ],

  webpackFinal: async (config, { configType }) => {
    if (rootMain.webpackFinal) {
      config = await rootMain.webpackFinal(config, { configType });
    }
    return config;
  },

  babel: async (options) => ({
    ...options,
    presets: [
      ...(options.presets || []),
      '@babel/preset-typescript',
      '@babel/preset-react',
    ],
    plugins: options.plugins || [],
  }),

  docs: {},
};
