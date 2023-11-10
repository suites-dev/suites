import type { Config } from 'jest';
import baseConfig from '../../../jest.base.config';

const config: Config = {
  ...baseConfig,
  id: 'adapters.nestjs',
  displayName: 'adapters.nestjs',
  collectCoverageFrom: ['src/**/*.ts', '__test__/**/*.ts'],
  coveragePathIgnorePatterns: ['index.ts', '__test__/integration.assets.ts'],
};

export default config;
