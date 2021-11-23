import { DeepPartial } from 'ts-essentials';
import { CalledWithMock, DeepMockProxy, mock } from 'jest-mock-extended';
import { UnitBuilder } from './unit-builder';
import { MockResolver } from './mock-resolver';

export type DeepMockOf<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer B
    ? CalledWithMock<B, A>
    : DeepMockProxy<T[K]>;
} & T;

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

export type MockFunction = typeof mock;
