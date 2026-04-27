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

const AdmZip = require('adm-zip');

const TEST_DIR = path.resolve(__dirname, 'src/test');
const TEST_CONFIG_PATH = path.join(TEST_DIR, 'config.json');
const TEST_ASSETS_PATH = path.join(TEST_DIR, 'Assets');

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
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
              return false;
            }
            return true;
          },
        },
      },
      // Allow cross-origin requests from the editor dev server (localhost:4200)
      headers: { 'Access-Control-Allow-Origin': '*' },
      setupMiddlewares: (middlewares, devServer) => {
        // CORS preflight for all dev endpoints
        devServer.app.use((req, res, next) => {
          if (req.method === 'OPTIONS') {
            setCors(res);
            res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            return res.sendStatus(204);
          }
          next();
        });

        // POST /test-config — fast path, no assets (content-only lessons)
        // Body: raw AU JSON string
        devServer.app.post('/test-config', (req, res) => {
          setCors(res);
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              JSON.parse(body); // validate
              fs.mkdirSync(TEST_DIR, { recursive: true });
              fs.writeFileSync(TEST_CONFIG_PATH, body, 'utf-8');
              res.json({ success: true });
            } catch (err) {
              res.status(400).json({ success: false, error: err.message });
            }
          });
        });

        // POST /upload-lesson-zip — full path with assets, zip bytes sent directly from browser
        // Query param: lessonDirPath — path inside zip to the lesson folder
        //              (e.g. "compiled_course/blocks/sandbox/intro")
        // Body: raw zip bytes (application/octet-stream)
        devServer.app.post('/upload-lesson-zip', (req, res) => {
          setCors(res);
          const lessonDirPath = req.query['lessonDirPath'];
          if (!lessonDirPath) {
            return res
              .status(400)
              .json({
                success: false,
                error: 'lessonDirPath query param is required',
              });
          }

          const chunks = [];
          req.on('data', (chunk) => {
            chunks.push(chunk);
          });
          req.on('end', () => {
            try {
              const zipBuffer = Buffer.concat(chunks);
              const zip = new AdmZip(zipBuffer);

              // Extract config.json
              const configEntry = zip.getEntry(`${lessonDirPath}/config.json`);
              if (!configEntry) {
                return res
                  .status(400)
                  .json({
                    success: false,
                    error: `config.json not found at ${lessonDirPath}/config.json in zip`,
                  });
              }
              fs.mkdirSync(TEST_DIR, { recursive: true });
              fs.writeFileSync(
                TEST_CONFIG_PATH,
                configEntry.getData().toString('utf-8'),
                'utf-8',
              );

              // Extract Assets/ folder if present
              const assetsPrefix = `${lessonDirPath}/Assets/`;
              const assetEntries = zip
                .getEntries()
                .filter(
                  (e) => e.entryName.startsWith(assetsPrefix) && !e.isDirectory,
                );
              if (assetEntries.length > 0) {
                fs.rmSync(TEST_ASSETS_PATH, { recursive: true, force: true });
                for (const entry of assetEntries) {
                  const relPath = entry.entryName.slice(assetsPrefix.length);
                  const destPath = path.join(TEST_ASSETS_PATH, relPath);
                  fs.mkdirSync(path.dirname(destPath), { recursive: true });
                  fs.writeFileSync(destPath, entry.getData());
                }
              } else {
                fs.rmSync(TEST_ASSETS_PATH, { recursive: true, force: true });
              }

              res.json({ success: true, assetsCount: assetEntries.length });
            } catch (err) {
              res.status(500).json({ success: false, error: err.message });
            }
          });
        });

        // POST /load-course-zip — full path with assets (Electron/disk path variant)
        // Body JSON: { zipPath: string, lessonDirPath: string }
        //   zipPath       — absolute path to the exported zip on disk (e.g. C:\Users\...\Downloads\sandbox.zip)
        //   lessonDirPath — path inside zip to the lesson folder
        //                   (e.g. "compiled_course/blocks/sandbox/intro")
        devServer.app.post('/load-course-zip', (req, res) => {
          setCors(res);
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const { zipPath, lessonDirPath } = JSON.parse(body);

              if (!zipPath || !lessonDirPath) {
                return res
                  .status(400)
                  .json({
                    success: false,
                    error: 'zipPath and lessonDirPath are required',
                  });
              }
              if (!fs.existsSync(zipPath)) {
                return res
                  .status(400)
                  .json({ success: false, error: `Zip not found: ${zipPath}` });
              }

              const zip = new AdmZip(zipPath);

              // Extract config.json
              const configEntry = zip.getEntry(`${lessonDirPath}/config.json`);
              if (!configEntry) {
                return res
                  .status(400)
                  .json({
                    success: false,
                    error: `config.json not found at ${lessonDirPath}/config.json in zip`,
                  });
              }
              fs.mkdirSync(TEST_DIR, { recursive: true });
              fs.writeFileSync(
                TEST_CONFIG_PATH,
                configEntry.getData().toString('utf-8'),
                'utf-8',
              );

              // Extract Assets/ folder if present
              const assetsPrefix = `${lessonDirPath}/Assets/`;
              const assetEntries = zip
                .getEntries()
                .filter(
                  (e) => e.entryName.startsWith(assetsPrefix) && !e.isDirectory,
                );
              if (assetEntries.length > 0) {
                fs.rmSync(TEST_ASSETS_PATH, { recursive: true, force: true });
                for (const entry of assetEntries) {
                  const relPath = entry.entryName.slice(assetsPrefix.length);
                  const destPath = path.join(TEST_ASSETS_PATH, relPath);
                  fs.mkdirSync(path.dirname(destPath), { recursive: true });
                  fs.writeFileSync(destPath, entry.getData());
                }
              } else {
                // No assets in this lesson — clear stale assets from previous run
                fs.rmSync(TEST_ASSETS_PATH, { recursive: true, force: true });
              }

              res.json({ success: true, assetsCount: assetEntries.length });
            } catch (err) {
              res.status(500).json({ success: false, error: err.message });
            }
          });
        });

        return middlewares;
      },
    },
  });
  return theConfig;
});
