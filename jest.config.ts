import { Config } from '@jest/types';
import baseConfig from './jest.base.config';

const config: Config.InitialOptions = {
  ...baseConfig(process.env.COVERAGE_DIR),
  projects: [
    '<rootDir>/packages/unit',
    '<rootDir>/packages/core',
    '<rootDir>/packages/di/nestjs',
    '<rootDir>/packages/di/inversify',
    '<rootDir>/packages/doubles/jest',
    '<rootDir>/packages/doubles/sinon',
  ],
};

export default config;
