import baseConfig from '../../../jest.base.config';
import process from 'process';

const config = {
  ...baseConfig(process.env.COVERAGE_DIR),
  id: 'jest',
  displayName: 'jest',
};

export default config;
