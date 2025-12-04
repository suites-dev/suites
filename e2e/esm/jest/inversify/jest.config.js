/**
 * Jest configuration for ESM + TypeScript + Inversify
 * @type {import('jest').Config}
 */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',

  extensionsToTreatAsEsm: ['.ts'],

  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          module: 'NodeNext',
          moduleResolution: 'NodeNext',
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
        },
      },
    ],
  },

  testMatch: ['**/*.e2e.test.ts'],
  collectCoverage: false,
  testTimeout: 10000,
};
