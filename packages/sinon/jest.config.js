const base = require('../../jest.config.base');
const packageJson = require('./package');

module.exports = {
  ...base,
  roots: [...base.roots, '<rootDir>/test'],
  name: packageJson.name,
  displayName: packageJson.name,
  collectCoverageFrom: ['src/**/*.ts', 'test/**/*.ts'],
  coveragePathIgnorePatterns: ['index.ts', 'test-classes.ts'],
};