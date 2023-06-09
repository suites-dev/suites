import { Type } from '@automock/types';

export type PrimitiveValue = string | number | boolean | symbol | null;

export type ClassDependencies = Map<Type | string, Type | PrimitiveValue>;

export interface DependenciesReflector {
  reflectDependencies(targetClass: Type): ClassDependencies;
}
