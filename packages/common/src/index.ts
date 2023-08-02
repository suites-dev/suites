import { Type } from '@automock/types';
export const UndefinedOrNotFound: unique symbol = Symbol('UndefinedOrNotFound');
export type UndefinedOrNotFoundSymbol = typeof UndefinedOrNotFound;

export type PrimitiveValue = unknown[] | string | number | boolean | symbol | null;

/**
 * @deprecated
 * Use `ClassCtorInjectables` instead
 */
export type ClassDependencies = [
  Type | string,
  PrimitiveValue | Type | UndefinedOrNotFoundSymbol
][];

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
  value?: PrimitiveValue | Type | UndefinedOrNotFoundSymbol;
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
