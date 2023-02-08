import { DeepPartial } from 'ts-essentials';
import { mock } from 'jest-mock-extended';
import { TestbedResolver } from './services/testbed-resolver.service';
import { MockResolver } from './services/mock-resolver';

export interface Override<T> {
  using: (implementation: DeepPartial<T>) => TestbedResolver;
}

export interface UnitTestbed<TClass = any> {
  unit: TClass;
  unitRef: MockResolver;
}

export interface Type<T = any> extends Function {
  new (...args: any[]): T;
}

export type ForwardRefToken = { forwardRef: () => Type };
export type CustomInjectableToken = ForwardRefToken | string;
export type ConstructorParam = Type | CustomInjectableToken;
export type ClassDependencies = Map<Type | string, Type>;

export type MockFunction = typeof mock;
