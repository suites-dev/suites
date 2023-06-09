import type { Config } from '@jest/types';
import base from '../../../jest.config';

export default async (): Promise<Config.InitialOptions> => {
  const baseConfig = (await base()) as Config.InitialOptions;

  return {
    ...baseConfig,
    name: 'adapters.nestjs',
    displayName: 'adapters.nestjs',
    collectCoverageFrom: ['src/**/*.ts'],
    coveragePathIgnorePatterns: ['index.ts'],
  };
};
