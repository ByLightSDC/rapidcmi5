const { merge } = require('webpack-merge');
const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');
const { resolve } = require('path');

const fontStylesheet = resolve(__dirname, 'src/assets/fonts/stylesheet.css');

module.exports = composePlugins(withNx(), withReact(), (config) => {
  // These stylesheets use css-loader directly instead of Nx's PostCSS pipeline.
  config.module.rules.forEach((rule) => {
    if (rule.oneOf) {
      rule.oneOf.forEach((oneOfRule) => {
        if (oneOfRule.test && oneOfRule.test.toString().includes('css')) {
          // Nx's asset processor loses drive letters in Windows font paths.
          if (Array.isArray(oneOfRule.exclude)) {
            oneOfRule.exclude.push(/monaco-editor/, fontStylesheet);
          } else if (oneOfRule.exclude) {
            oneOfRule.exclude = [oneOfRule.exclude, /monaco-editor/, fontStylesheet];
          } else {
            oneOfRule.exclude = [/monaco-editor/, fontStylesheet];
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

  // Let css-loader resolve font URLs and the asset/resource rule emit the fonts.
  config.module.rules.unshift({
    test: /\.css$/,
    include: fontStylesheet,
    use: ['style-loader', 'css-loader'],
  });

  // Add font handling rule
  config.module.rules.push({
    test: /\.(woff|woff2|eot|ttf|otf)$/i,
    type: 'asset/resource',
  });

  config.module.rules.push({
    test: /\.mdx?$/,
    use: [
      {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env', '@babel/preset-react'],
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
