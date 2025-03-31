import type { Config } from 'jest';
import baseConfig from '../../jest.base.config';

const config: Config = {
  ...baseConfig(process.env.COVERAGE_DIR),
  id: 'cli',
  displayName: 'cli',
  collectCoverageFrom: ['src/**/*.ts', '__test__/**/*.ts'],
};

export default config;
