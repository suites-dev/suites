import { defineConfig } from 'vitest/config';
import process from 'process';

export default defineConfig({
  test: {
    reporters: ['default', 'junit'],
    outputFile: {
      junit:
        (process.env.JUNIT_OUTPUT_DIR || '.') +
        '/' +
        (process.env.JUNIT_OUTPUT_NAME || 'junit') +
        '.xml',
    },
    coverage: {
      exclude: [
        '**/*.spec.ts',
        '**/node_modules/**',
        '**/index.ts',
        '**/testbed-factory.ts',
        'postinstall.mjs',
      ],
      reportsDirectory: process.env.COVERAGE_DIR || 'coverage',
      reporter: [
        'text',
        [
          'cobertura',
          {
            file: process.env.COVERAGE_FILE || 'coverage-report.xml',
          },
        ],
      ],
    },
    globals: true,
    include: ['**/*.spec.ts'],
    exclude: ['node_modules', 'dist', '**/node_modules/**'],
  },
});
