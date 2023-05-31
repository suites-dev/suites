import { Type } from '@automock/types';

export type ClassDependencies = Map<Type | string, Type>;

export interface DependenciesReflector {
  reflectDependencies(targetClass: Type): ClassDependencies;
}
