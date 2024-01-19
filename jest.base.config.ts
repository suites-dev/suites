import { Config } from '@jest/types';

const config: Config.InitialOptions = {
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
    ],
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'spec-assets.ts',
    '/__test__/assets/',
    'testbed-factory.ts',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
  testEnvironment: 'node',
  coverageDirectory: './coverage',
  coverageReporters: [
    'text',
    [
      'cobertura',
      {
        file: process.env.COVERAGE_FILE || 'coverage-report.xml',
        projectRoot: process.env.COVERAGE_DIR || '<rootDir>',
      },
    ],
  ],
  reporters: ['default', 'jest-junit'],
  testResultsProcessor: 'jest-junit',
};

export default config;
