/**
 * Jest configuration for ESM + TypeScript + NestJS
 * @type {import('jest').Config}
 */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Treat .ts files as ESM
  extensionsToTreatAsEsm: ['.ts'],

  // Transform @suites packages from node_modules (they're ESM)
  transformIgnorePatterns: [
    'node_modules/(?!(@suites|@nestjs)/)',
  ],

  // Map .js imports to .ts source files (TypeScript ESM quirk)
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    // Force @suites packages to use CJS build in node_modules
    '^@suites/(.+)$': '<rootDir>/node_modules/@suites/$1/dist/cjs/index.js',
  },

  // Transform TypeScript AND JavaScript files with ESM support
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
    '^.+\\.m?jsx?$': [
      'ts-jest',
      {
        useESM: true,
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
