import { DeepPartial } from 'ts-essentials';
import { CalledWithMock } from 'jest-mock-extended';
import { SinonStubbedInstance, SinonStubbedMember } from 'sinon';

export type JestMockFn<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer B ? CalledWithMock<B, A> : T[K];
} & T;

export type SinonMockFn<T> = SinonStubbedInstance<T>;

export type SinonMockOverrides<T> = {
  [K in keyof T]?: SinonStubbedMember<T[K]> | (T[K] extends (...args: any[]) => infer R ? R : T[K]);
};

export type MockFn<T, MockFn extends JestMockFn<T> | SinonMockFn<T>> = MockFn;

export type MockPartialImplementation<T> = DeepPartial<T> | SinonMockOverrides<T>;

export interface Type<T = any> extends Function {
  new (...args: any[]): T;
}

export type DependencyKey<T = unknown> = string | Type<T>;

export type DependencyType = Type<unknown> | null;
