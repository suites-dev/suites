import type { Config } from '@jest/types';

export default async (coverageFileName = 'coverage-report'): Promise<Config.InitialOptions> => {
  return {
    preset: 'ts-jest',
    roots: ['<rootDir>/src', '<rootDir>/test'],
    rootDir: '.',
    moduleFileExtensions: ['js', 'json', 'ts'],
    testRegex: '.(spec|test).ts$',
    transform: {
      '^.+\\.(t|j)s$': 'ts-jest',
    },
    coveragePathIgnorePatterns: ['/node_modules/', 'spec-assets.ts', 'spec-assets.js'],
    testPathIgnorePatterns: ['/node_modules/'],
    coverageDirectory: './coverage',
    coverageReporters: ['text', ['cobertura', { file: `${coverageFileName}.xml` }]],
    testEnvironment: 'node',
    reporters: ['default', 'jest-junit'],
    testResultsProcessor: 'jest-junit',
    globals: {
      'ts-jest': {
        isolatedModules: true,
      },
    },
  };
};
