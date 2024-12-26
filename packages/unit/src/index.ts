export { TestBed } from './testbed';
export type { UnitTestBed, TestBedBuilder } from './types';
export type {
  UnitReference,
  MockOverride,
  SolitaryTestBedBuilder,
  SociableTestBedBuilder,
} from '@suites/core.unit';

// Re-export commonly used types from testing framework-specific packages
export type {
  Mocked,
  JestMocked,
  VitestMocked,
  SinonMocked,
  StubbedInstance,
} from './types.doubles.ts';
