import type { Config } from '@jest/types';
import base from '../../../jest.config';

export default async (): Promise<Config.InitialOptions> => {
  const baseConfig = (await base()) as Config.InitialOptions;

  return {
    ...baseConfig,
    id: 'adapters.nestjs',
    displayName: 'adapters.nestjs',
    collectCoverageFrom: ['src/**/*.ts', '__test__/**/*.ts'],
    coveragePathIgnorePatterns: ['index.ts', '__test__/integration.assets.ts'],
  };
};
