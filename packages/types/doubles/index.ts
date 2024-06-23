import type { DeepPartial } from '@suites/types.common';

export type ArgsType<T> = T extends (...args: infer A) => any ? A : never;

export interface Stub<ReturnType, Args extends any[]> {
  (...args: Args): ReturnType;
}

export interface StubbedMember<T> {
  [key: string]: T extends (...args: any[]) => infer ReturnValue
    ? Stub<ReturnValue, ArgsType<T>>
    : StubbedMember<T>;
}

export type StubbedInstance<TClass> = {
  [Prop in keyof TClass]: StubbedMember<TClass[Prop]>;
};

export type MockFunction<TType = unknown> = (
  implementation?: DeepPartial<TType>
) => StubbedInstance<TType>;

export type StubFactory<T = unknown> = () => Stub<T, []>;

export type StubCallback<TDependency> = (stubFn: Stub<TDependency, []>) => DeepPartial<TDependency>;

export type DoublesAdapter = {
  mock: MockFunction;
  stub: Stub<unknown, []>;
};
