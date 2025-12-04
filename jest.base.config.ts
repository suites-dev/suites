const path = require('path');
const packagesDir = path.join(__dirname, 'packages');

const config = (coverageDir?: string) => ({
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
    '^@suites/core.unit(.*)$': path.join(packagesDir, 'core/src$1'),
    '^@suites/types.common(.*)$': path.join(packagesDir, 'types/common/src$1'),
    '^@suites/types.di(.*)$': path.join(packagesDir, 'types/di/src$1'),
    '^@suites/types.doubles(.*)$': path.join(packagesDir, 'types/doubles/src$1'),
    '^@suites/di.nestjs(.*)$': path.join(packagesDir, 'di/nestjs/src$1'),
    '^@suites/di.inversify(.*)$': path.join(packagesDir, 'di/inversify/src$1'),
    '^@suites/doubles.jest(.*)$': path.join(packagesDir, 'doubles/jest/src$1'),
    '^@suites/doubles.sinon(.*)$': path.join(packagesDir, 'doubles/sinon/src$1'),
    '^@suites/doubles.vitest(.*)$': path.join(packagesDir, 'doubles/vitest/src$1'),
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
});

export default config;
