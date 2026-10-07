import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: __dirname,
  test: {
    name: 'cmi5-build-common',
    environment: 'node',
    include: ['src/**/*.{spec,test}.{ts,tsx}'],
    coverage: {
      reportsDirectory: resolve(__dirname, '../../coverage/packages/common'),
    },
  },
});
