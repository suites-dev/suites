import baseConfig from '../../../jest.base.config';
import * as process from 'process';

const config = {
  ...baseConfig(process.env.COVERAGE_DIR),
  id: 'sinon',
  displayName: 'sinon',
};

export default config;
