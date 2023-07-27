import { Type } from '@automock/types';

export type PrimitiveValue = string | number | boolean | symbol | null;

/**
 * @deprecated
 * Use `ClassCtorInjectables` instead
 */
export type ClassDependencies = [Type | string, PrimitiveValue | Type][];

/**
 * @since 2.1.0
 */
export type ClassCtorInjectables = ClassDependencies;

/**
 * @since 2.1.0
 */
export interface ClassInjectableProperty {
  property: string;
  typeOrToken: Type | string;
  value?: PrimitiveValue | Type;
}

/**
 * @since 2.1.0
 */
export type ClassPropsInjectables = ClassInjectableProperty[];

export interface ClassDependenciesMap {
  /**
   * @since 2.0.0
   */
  constructor: ClassCtorInjectables;

  /**
   * @since 2.1.0
   */
  properties: ClassPropsInjectables;
}

export interface DependenciesReflector {
  reflectDependencies(targetClass: Type): ClassDependenciesMap;
}
