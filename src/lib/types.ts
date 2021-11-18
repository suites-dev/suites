import { DeepPartial } from 'ts-essentials';
import { CalledWithMock, DeepMockProxy } from 'jest-mock-extended';
import { DependenciesBuilder } from './dependencies-builder';
import { MockResolver } from './mock-resolver';

export type DeepMock<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer B ? CalledWithMock<B, A> : DeepMockProxy<T[K]>;
} &
  T;

export interface Override<TClass> {
  using: (partial: DeepPartial<TClass>) => DependenciesBuilder;
}

export interface UnitTestingClass<TClass> {
  unit: TClass;
  unitRef: MockResolver;
}