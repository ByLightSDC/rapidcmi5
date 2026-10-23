import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: __dirname,
  resolve: {
    alias: {
      '@rapid-cmi5/cmi5-build-common': resolve(
        __dirname,
        '../../packages/common/src/index.ts',
      ),
    },
  },
  test: {
    name: 'cmi5-builder',
    environment: 'node',
    include: ['src/**/*.{spec,test}.{ts,tsx}'],
    coverage: {
      reportsDirectory: resolve(__dirname, '../../coverage/apps/cmi5-builder'),
    },
  },
});
