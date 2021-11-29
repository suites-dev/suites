const base = require('./jest.config.base');

module.exports = {
  ...base,
  roots: ['<rootDir>'],
  projects: [
    '<rootDir>/packages/jest',
    '<rootDir>/packages/sinon',
    '<rootDir>/packages/core',
    '<rootDir>/packages/common',
  ],
};
