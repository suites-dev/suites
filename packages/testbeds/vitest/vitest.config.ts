import { defineConfig } from 'vitest/config';

const coverageFile =
  (process.env.COVERAGE_DIR || '') + '/' + (process.env.COVERAGE_FILE || 'coverage-report.xml');

console.log(coverageFile);

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
            file: coverageFile,
          },
        ],
      ],
    },
    globals: true,
    include: ['**/*.spec.ts'],
    exclude: ['node_modules', 'dist', '**/node_modules/**'],
  },
});
