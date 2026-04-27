const { merge } = require('webpack-merge');
const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');

module.exports = composePlugins(withNx(), withReact(), (config) => {
  // Find and modify existing CSS rules to exclude monaco-editor
  config.module.rules.forEach((rule) => {
    if (rule.oneOf) {
      rule.oneOf.forEach((oneOfRule) => {
        if (oneOfRule.test && oneOfRule.test.toString().includes('css')) {
          // Add monaco-editor to exclude
          if (Array.isArray(oneOfRule.exclude)) {
            oneOfRule.exclude.push(/monaco-editor/);
          } else if (oneOfRule.exclude) {
            oneOfRule.exclude = [oneOfRule.exclude, /monaco-editor/];
          } else {
            oneOfRule.exclude = /monaco-editor/;
          }
        }
      });
    }
  });

  // Add a specific rule for monaco-editor CSS at the beginning of the rules array
  // (rules are processed top to bottom, first match wins)
  config.module.rules.unshift({
    test: /\.css$/,
    include: /monaco-editor/,
    use: ['style-loader', 'css-loader'],
  });

  // Add font handling rule
  config.module.rules.push({
    test: /\.(woff|woff2|eot|ttf|otf)$/i,
    type: 'asset/resource',
  });

  // MDX rule — swc-loader handles JSX output from @mdx-js/loader
  config.module.rules.push({
    test: /\.mdx?$/,
    use: [
      {
        loader: 'swc-loader',
        options: {
          jsc: {
            parser: { syntax: 'ecmascript', jsx: true },
            transform: { react: { runtime: 'automatic' } },
          },
        },
      },
      {
        loader: '@mdx-js/loader',
        options: {},
      },
    ],
  });

  config.resolve.extensions.push('.mdx');

  // Add Node.js polyfills for webpack 5
  config.resolve.fallback = {
    ...config.resolve.fallback,
    util: require.resolve('util/'),
  };

  const theConfig = merge(config, {
    cache: {
      type: 'filesystem',
    },
    ignoreWarnings: [/Failed to parse source map/],
    devServer: {
      client: {
        overlay: {
          runtimeErrors: (error) => {
            if (error.message.includes('ResizeObserver')) {
              return false;
            }
            return true;
          },
        },
      },
      proxy: [
        {
          context: ['/api'],
          target: 'http://localhost:3000',
          secure: false,
        },
      ],
    },
  });
  
  return theConfig;
});