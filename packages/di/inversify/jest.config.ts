import type { Config } from 'jest';
import baseConfig from '../../../jest.base.config';

const config: Config = {
  ...baseConfig(process.env.COVERAGE_DIR),
  id: 'di.inversify',
  displayName: 'di.inversify',
  collectCoverageFrom: ['src/**/*.ts'],
  coveragePathIgnorePatterns: ['index.ts', '__test__/assets/integration.assets.ts'],
};

export default config;
