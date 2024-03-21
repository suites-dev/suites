import type { Config } from 'jest';
import baseConfig from '../../../jest.base.config';
import process from 'process';

const config: Config = {
  ...baseConfig(process.env.COVERAGE_DIR),
  id: 'adapters.nestjs',
  displayName: 'adapters.nestjs',
  collectCoverageFrom: ['src/**/*.ts'],
  coveragePathIgnorePatterns: ['index.ts', '__test__/assets/integration.assets.ts'],
};

export default config;
