const { merge } = require('webpack-merge');
const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), withReact(), (config) => {
  // Update the webpack config as needed here.
  // e.g. `config.plugins.push(new MyPlugin())`

  const theConfig = merge(config, {
    ignoreWarnings: [/Failed to parse source map/],
    devServer: {
      client: {
        overlay: {
          runtimeErrors: (error) => {
            if (error.message.includes('ResizeObserver')) {
              //ReactFlow Lib events can trigger this error
              //Mostly Harmless, Prevent Overlay From Displaying
              return false;
            }
            return true;
          },
        },
      },
    },
  });
  return theConfig;
});
