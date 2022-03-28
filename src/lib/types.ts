import { DeepPartial } from 'ts-essentials';
import { mock } from 'jest-mock-extended';
import { UnitBuilder } from './unit-builder';
import { MockResolver } from './mock-resolver';

export interface Override<T> {
  using: (mockImplementation: DeepPartial<T>) => UnitBuilder;
}

export interface TestingUnit<TClass = any> {
  unit: TClass;
  unitRef: MockResolver;
}

export interface Type<T = any> extends Function {
  new (...args: any[]): T;
}

export type MockFunction = typeof mock;
