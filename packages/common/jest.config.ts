import type { Config } from '@jest/types';
import base from '../../jest.config';

export default async (): Promise<Config.InitialOptions> => {
  const baseConfig = (await base()) as Config.InitialOptions;

  return {
    ...baseConfig,
    name: 'common',
    displayName: 'common',
    collectCoverageFrom: ['src/**/*.ts', '__test__/**/*.ts'],
    coveragePathIgnorePatterns: ['index.ts'],
  };
};
