import type { Config } from '@jest/types';
import base from '../../jest.config';

export default async (): Promise<Config.InitialOptions> => {
  const baseConfig = (await base()) as Config.InitialOptions;

  return {
    ...baseConfig,
    id: 'core',
    displayName: 'core',
    collectCoverageFrom: ['src/**/*.ts', '__test__/**/*.ts'],
    coveragePathIgnorePatterns: [
      'index.ts',
      'integration.assets.ts',
      'invalid-adapter.ts',
      'test-adapter.ts',
      'main.ts',
      'types.ts',
    ],
  };
};
