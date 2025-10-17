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
    '^(\\.{1,2}/.*)\\.js$': '$1',
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
