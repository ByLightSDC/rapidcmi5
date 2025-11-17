const rootMain = require('../../../../../.storybook/main');

module.exports = {
  ...rootMain,
  stories: ['../src/lib/**/*.mdx', '../src/lib/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-interactions',
    ...rootMain.addons,
    '@nx/react/plugins/storybook',
  ],

  webpackFinal: async (config, { configType }) => {
    // apply any global webpack configs that might have been specified in .storybook/main.js
    if (rootMain.webpackFinal) {
      config = await rootMain.webpackFinal(config, { configType });
    }

    // add your own webpack tweaks if needed
    //SWC compiler does not handle react files
    //@babel/preset-react is a Babel preset that transforms React JSX syntax to plain JS. Adding {"runtime": "automatic"} enables a new JSX transform [introduced in React 17] that uses the React runtime to generate necessary code for JSX expressions.
    config.module.rules.push({
      test: /\.tsx?$/,
      exclude: /node_modules/,
      use: [
        {
          loader: require.resolve('babel-loader'),
          options: {
            presets: [
              require('@babel/preset-typescript').default,
              [
                require('@babel/preset-react').default,
                { runtime: 'automatic' },
              ],
              require('@babel/preset-env').default,
            ],
          },
        },
        //require.resolve('react-docgen-typescript-loader'),
      ],
    });

    config.resolve.extensions.push('.ts', '.tsx');

    return config;
  },

  docs: {},
};
