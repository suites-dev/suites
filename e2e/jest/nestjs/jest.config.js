module.exports = {
  preset: 'ts-jest',
  rootDir: '.',
  moduleFileExtensions: ['ts', 'js'],
  testRegex: '.e2e.test.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  testEnvironment: 'node',
};
