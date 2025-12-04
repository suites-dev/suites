/**
 * Jest configuration for ESM + TypeScript + NestJS
 * @type {import('jest').Config}
 */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Treat .ts files as ESM
  extensionsToTreatAsEsm: ['.ts'],

  // Map .js imports to .ts source files (TypeScript ESM quirk)
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  // Transform TypeScript files with ESM support
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

  // Only run e2e test files
  testMatch: ['**/*.e2e.test.ts'],

  // Disable coverage for e2e tests
  collectCoverage: false,

  // Increase timeout for integration tests
  testTimeout: 10000,
};
