import type { Config } from '@jest/types';

export default async (): Promise<Config.InitialOptions> => {
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
      ],
    },
    coveragePathIgnorePatterns: [
      '/node_modules/',
      'spec-assets.ts',
      'testbed-factory.ts',
      '__test__/**/*.ts',
    ],
    testPathIgnorePatterns: ['/node_modules/'],
    coverageDirectory: './coverage',
    coverageReporters: ['text', ['cobertura', { file: 'coverage-report.xml' }]],
    testEnvironment: 'node',
    reporters: ['default', 'jest-junit'],
    testResultsProcessor: 'jest-junit',
    projects: [
      '<rootDir>/packages/core',
      '<rootDir>/packages/adapters/nestjs',
      '<rootDir>/packages/testbeds/jest',
      '<rootDir>/packages/testbeds/sinon',
    ],
  };
};
