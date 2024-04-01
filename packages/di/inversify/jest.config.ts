import type { Config } from 'jest';
import baseConfig from '../../../jest.base.config';

const config: Config = {
  ...baseConfig(process.env.COVERAGE_DIR),
  id: 'adapters.inversify',
  displayName: 'adapters.inversify',
  collectCoverageFrom: ['src/**/*.ts'],
  coveragePathIgnorePatterns: ['index.ts', '__test__/assets/integration.assets.ts'],
};

export default config;
