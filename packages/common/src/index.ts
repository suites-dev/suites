import { Type } from '@automock/types';

export type PrimitiveValue = string | number | boolean | symbol | null;

export type ClassDependencies = [Type | string, PrimitiveValue | Type][];

export interface ClassDependenciesMap {
  constructor: ClassDependencies;
}

export interface DependenciesReflector {
  reflectDependencies(targetClass: Type): ClassDependenciesMap;
}
