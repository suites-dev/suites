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
      reporter: [
        'text',
        [
          'cobertura',
          {
            projectRoot: process.env.PROJECT_ROOT || './',
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
