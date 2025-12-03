import type { Config } from 'jest';
import baseConfig from '../../jest.base.config';

const config: Config = {
  ...baseConfig(process.env.COVERAGE_DIR),
  id: 'core',
  displayName: 'core',
  collectCoverageFrom: ['src/**/*.ts', '__test__/**/*.ts'],
  coveragePathIgnorePatterns: [
    'injectable-registry.fixture.ts',
    '__test__/sociable/assets',
    'index.ts',
    'integration.assets.ts',
    'invalid-adapter.ts',
    'test-adapter.ts',
    'main.ts',
    'types.ts',
  ],
};

export default config;
