import { Config } from '@jest/types';
import baseConfig from '../../../jest.base.config';
import * as process from 'process';

const config: Partial<Config.InitialOptions> = {
  ...baseConfig(process.env.COVERAGE_DIR),
  id: 'sinon',
  displayName: 'sinon',
};

export default config;
