const base = require('./jest.config.base');

module.exports = {
  ...base,
  roots: ['<rootDir>'],
  projects: [
    '<rootDir>/packages/core',
    '<rootDir>/packages/common',
    '<rootDir>/packages/reflect',
    '<rootDir>/packages/libraries/jest',
    '<rootDir>/packages/libraries/sinon',
    '<rootDir>/packages/frameworks/nestjs',
  ],
};
