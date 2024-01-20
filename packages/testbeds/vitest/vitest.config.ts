import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Base configuration for all tests
    globals: true,
    include: ['**/*.spec.ts'],
    exclude: ['node_modules', 'dist', '**/node_modules/**'],
  },
});
