import type { Config } from '@jest/types';

export default async (coverageFileName = 'coverage-report'): Promise<Config.InitialOptions> => {
  return {
    roots: ['<rootDir>/src', '<rootDir>/test'],
    rootDir: '.',
    moduleFileExtensions: ['json', 'ts'],
    testRegex: '.spec.ts$',
    transform: {
      '^.+\\.(t|j)s$': 'ts-jest',
    },
    coveragePathIgnorePatterns: ['/node_modules/', 'spec-assets.ts', 'spec-assets.js'],
    testPathIgnorePatterns: ['/node_modules/', 'sample'],
    coverageDirectory: './coverage',
    coverageReporters: ['text', ['cobertura', { file: `${coverageFileName}.xml` }]],
    testEnvironment: 'node',
    reporters: ['default', 'jest-junit'],
    testResultsProcessor: 'jest-junit',
  };
};
