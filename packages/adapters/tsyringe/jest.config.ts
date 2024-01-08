import type { Config } from 'jest';
import baseConfig from '../../../jest.base.config';

const config: Config = {
  ...baseConfig,
  id: 'adapters.tsyringe',
  displayName: 'adapters.tsyringe',
  collectCoverageFrom: ['src/**/*.ts'],
  coveragePathIgnorePatterns: ['index.ts', '__test__/assets/integration.assets.ts'],
};

export default config;
