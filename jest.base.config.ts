const path = require('path');

const config = (coverageDir?: string) => {
  // Find the monorepo root by looking for the packages directory
  const monorepoRoot = path.resolve(__dirname);

  return {
    preset: 'ts-jest',
    roots: ['<rootDir>'],
    rootDir: '.',
    moduleFileExtensions: ['js', 'json', 'ts'],
    testRegex: '.(spec|test).ts$',
    transform: {
      '^.+\\.(t|j)s$': [
        'ts-jest',
        {
          isolatedModules: true,
        },
      ] as any,
    },
    moduleNameMapper: {
      '^(\\.{1,2}/.*)\\.js$': '$1',
      '^@suites/core\\.unit$': path.join(monorepoRoot, 'packages/core/src/index.ts'),
      '^@suites/types\\.common$': path.join(monorepoRoot, 'packages/types/common/index.ts'),
      '^@suites/types\\.di$': path.join(monorepoRoot, 'packages/types/di/src/index.ts'),
      '^@suites/types\\.doubles$': path.join(monorepoRoot, 'packages/types/doubles/index.d.ts'),
    },
    coveragePathIgnorePatterns: ['/node_modules/', 'spec-assets.ts', '/__test__/'],
    testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
    testEnvironment: 'node',
    coverageDirectory: coverageDir || '<rootDir>',
    coverageReporters: [
      'text',
      [
        'cobertura',
        {
          file: process.env.COVERAGE_FILE || 'coverage-report.xml',
        },
      ],
    ] as any,
    reporters: ['default', 'jest-junit'],
    testResultsProcessor: 'jest-junit',
  };
};

export default config;
