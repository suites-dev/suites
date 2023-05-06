import { UnitReference } from './services/unit-reference';
import { Type, Callable, ArgsType } from '@automock/types';

export type Stubbable<TType> = Callable | TType;

type Stub<ReturnType, Args extends any[]> = {
  (...args: Args): ReturnType;
};

type StubbedMember<T> = T extends (...args: infer Args) => infer ReturnValue
  ? Stub<ReturnValue, ArgsType<T>>
  : T;

export type StubbedInstance<TClass> = TClass & {
  [Prop in keyof TClass]: StubbedMember<TClass[Prop]>;
};

export type ClassDependencies = Map<Type | string, Type>;

export interface DependenciesReflector {
  reflectDependencies(targetClass: Type): ClassDependencies;
}

export interface UnitTestbed<TClass> {
  unit: TClass;
  unitRef: UnitReference;
}

export type MockFunction<TType> = (implementation?: Stubbable<TType>) => StubbedInstance<TType>;
