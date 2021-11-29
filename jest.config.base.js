module.exports = {
  preset: 'ts-jest',
  roots: ['<rootDir>/src'],
  testEnvironment: 'node',
  collectCoverage: false,
  coveragePathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/node_modules/',
    '<rootDir/>/index.js',
  ],
  coverageReporters: [
    'text',
    'cobertura',
  ],
  coverageDirectory: '<rootDir>/coverage/',
  modulePathIgnorePatterns: ['./sample'],
  verbose: true
};
