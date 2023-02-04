import type { Config } from '@jest/types';
import base from './jest.base.config';

export default async (): Promise<Config.InitialOptions> => {
  return {
    ...base,
    roots: ['<rootDir>'],
    projects: ['<rootDir>/packages/jest'],
  };
};
