import { DeepPartial } from 'ts-essentials';
import { mock } from 'jest-mock-extended';
import { TestBedResolver } from './test-bed-resolver';
import { MockResolver } from './mock-resolver';

export interface Override<T> {
  using: (implementation: DeepPartial<T>) => TestBedResolver;
}

export interface UnitTestBed<TClass = any> {
  unit: TClass;
  unitRef: MockResolver;
}

export interface Type<T = any> extends Function {
  new (...args: any[]): T;
}

export type MockFunction = typeof mock;
