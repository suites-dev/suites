import type { Config } from 'jest';
import baseConfig from '../../../jest.base.config';

const config: Config = {
  ...baseConfig(process.env.COVERAGE_DIR),
  id: 'di.injection-js',
  displayName: 'di.injection-js',
  collectCoverageFrom: ['src/**/*.ts'],
  coveragePathIgnorePatterns: ['index.ts', 'types.ts', 'test/assets/integration.assets.ts'],
};

export default config;
