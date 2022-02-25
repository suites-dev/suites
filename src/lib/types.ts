import { DeepPartial } from 'ts-essentials';
import { CalledWithMock, mock } from 'jest-mock-extended';
import { UnitBuilder } from './unit-builder';
import { MockResolver } from './mock-resolver';

export type MockOf<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer B ? CalledWithMock<B, A> : T[K];
} & T;

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
