import { Type, Stubbable, StubbedInstance } from '@automock/types';
import { UnitReference } from './services/unit-reference';

export type ClassDependencies = Map<Type | string, Type>;

export interface DependenciesReflector {
  reflectDependencies(targetClass: Type): ClassDependencies;
}

export interface UnitTestbed<TClass> {
  unit: TClass;
  unitRef: UnitReference;
}

export type MockFunction<TType> = (implementation?: Stubbable<TType>) => StubbedInstance<TType>;
