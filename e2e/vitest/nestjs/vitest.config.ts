import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['**/*.e2e.test.ts'],
    exclude: ['node_modules', 'dist', '**/node_modules/**'],
  },
});
