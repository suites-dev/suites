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
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  coverageReporters: ['text', ['cobertura', { file: 'coverage-report.xml' }]],
  reporters: ['default', 'jest-junit'],
  testResultsProcessor: 'jest-junit',
};

export default config;
