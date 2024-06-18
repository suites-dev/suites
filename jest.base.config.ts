import { Config } from '@jest/types';

const config: (coverageDir?: string) => Config.InitialOptions = (coverageDir?: string) => ({
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
  ],
  reporters: ['default', 'jest-junit'],
  testResultsProcessor: 'jest-junit',
});

export default config;
