const config = (coverageDir?: string) => ({
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
    ] as any,
  },
  moduleNameMapper: {
    '^@suites/core.unit$': '<rootDir>/../../core/src',
    '^@suites/types.common$': '<rootDir>/../../types/common/src',
    '^@suites/types.di$': '<rootDir>/../../types/di/src',
    '^@suites/types.doubles$': '<rootDir>/../../types/doubles/src',
    '^@suites/di.nestjs$': '<rootDir>/../../di/nestjs/src',
    '^@suites/di.inversify$': '<rootDir>/../../di/inversify/src',
    '^@suites/doubles.jest$': '<rootDir>/../../doubles/jest/src',
    '^@suites/doubles.sinon$': '<rootDir>/../../doubles/sinon/src',
    '^@suites/doubles.vitest$': '<rootDir>/../../doubles/vitest/src',
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
  ] as any,
  reporters: ['default', 'jest-junit'],
  testResultsProcessor: 'jest-junit',
});

export default config;
