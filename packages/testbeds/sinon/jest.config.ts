import { Config } from '@jest/types';
import baseConfig from '../../../jest.base.config';

const config: Partial<Config.InitialOptions> = {
  ...baseConfig,
  id: 'sinon',
  displayName: 'sinon',
};

export default config;
