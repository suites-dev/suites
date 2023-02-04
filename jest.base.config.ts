import type { Config } from '@jest/types';

export default async (coverageFileName = 'coverage-report'): Promise<Config.InitialOptions> => {
  return {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    testRegex: '.(spec|test).ts$',
    transform: {
      '^.+\\.(t|j)s$': 'ts-jest',
    },
    coveragePathIgnorePatterns: ['/node_modules/', 'spec-assets.ts', 'spec-assets.js'],
    testPathIgnorePatterns: ['/node_modules/', 'sample'],
    coverageDirectory: './coverage',
    coverageReporters: ['text', 'cobertura'],
    testEnvironment: 'node',
  };
};
