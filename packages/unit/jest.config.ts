import type { Config } from 'jest';
import baseConfig from '../../jest.base.config';

const config: Config = {
  ...baseConfig(process.env.COVERAGE_DIR),
  id: 'core',
  displayName: 'core',
  collectCoverageFrom: ['src/**/*.ts', '__test__/**/*.ts'],
  coveragePathIgnorePatterns: [
    'index.ts',
    'invalid-adapter.ts',
    'test-adapter.ts',
    'testbed.ts',
    'types.ts',
  ],
};

export default config;
