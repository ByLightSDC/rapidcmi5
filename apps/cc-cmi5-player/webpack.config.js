const { merge } = require('webpack-merge');
const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');
const fs = require('fs');
const path = require('path');

const { version: rc5Version } = require('../../packages/common/package.json');

/*
  This is a manifest just for the player. It supports swapping out the player in the Moodle 
  plugin. 
*/
class PlayerManifestPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tapAsync(
      'PlayerManifestPlugin',
      (compilation, callback) => {
        const outputPath = compilation.outputOptions.path;
        const manifest = {
          playerVersion: rc5Version,
          buildTimestamp: Math.floor(Date.now() / 1000),
          files: [
            'index.html',
            'cfg.json',
            'favicon.ico',
            'env-config.js',
            '3rdpartylicenses.txt',
          ],
        };
        fs.writeFile(
          path.join(outputPath, 'player-manifest.json'),
          JSON.stringify(manifest, null, 2),
          'utf-8',
          callback,
        );
      },
    );
  }
}

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), withReact(), (config) => {
  // Exclude monaco-editor from default CSS rules (postcss-loader can't resolve .ttf)
  config.module.rules.forEach((rule) => {
    if (rule.oneOf) {
      rule.oneOf.forEach((oneOfRule) => {
        if (oneOfRule.test && oneOfRule.test.toString().includes('css')) {
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

  // Handle monaco-editor CSS without postcss-loader
  config.module.rules.unshift({
    test: /\.css$/,
    include: /monaco-editor/,
    use: ['style-loader', 'css-loader'],
  });

  // Handle font files referenced by monaco-editor
  config.module.rules.push({
    test: /\.(woff|woff2|eot|ttf|otf)$/i,
    type: 'asset/resource',
  });

  config.plugins = config.plugins || [];
  config.plugins.push(new PlayerManifestPlugin());

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
