import { Config } from '@jest/types';
import baseConfig from '../../../jest.base.config';
import process from 'process';

const config: Partial<Config.InitialOptions> = {
  ...baseConfig(process.env.COVERAGE_DIR),
  id: 'jest',
  displayName: 'jest',
};

export default config;
