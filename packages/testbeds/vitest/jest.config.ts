import { Config } from '@jest/types';
import baseConfig from '../../../jest.base.config';

const config: Partial<Config.InitialOptions> = {
  ...baseConfig(),
  id: 'vitest',
  displayName: 'vitest',
};

export default config;
