const base = require('./jest.config.base');

module.exports = {
  ...base,
  roots: ['<rootDir>'],
  projects: [
    '<rootDir>/packages/core',
    '<rootDir>/packages/common',
    '<rootDir>/packages/reflect',
    '<rootDir>/packages/runners/jest',
    '<rootDir>/packages/runners/sinon',
    '<rootDir>/packages/frameworks/nestjs',
  ],
};
