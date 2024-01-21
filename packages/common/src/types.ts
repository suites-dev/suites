import { Type } from '@suites/types';

/**
 * @since 2.2.0
 */
export const UndefinedDependency: unique symbol = Symbol('UndefinedDependency');
export type UndefinedDependencySymbol = typeof UndefinedDependency;

/**
 * @since 3.2.0
 */
export const NonExistingDependency: unique symbol = Symbol('NonExistingDependency');
export type NonExistingDependencySymbol = typeof NonExistingDependency;

/**
 * @since 3.0.0
 */
export type ConstantValue = unknown[] | string | number | boolean | symbol | null;

/**
 * @since 3.0.0
 */
export type InjectableIdentifier = Type | string | symbol;

/**
 * @since 3.0.0
 */
export type InjectableReflectedType = ConstantValue | Type | undefined;

/**
 * @since 3.0.0
 */
export type InjectableFinalValue =
  | ConstantValue
  | Type
  | UndefinedDependencySymbol
  /**
   * @since 3.2.0
   */
  | NonExistingDependencySymbol;

/**
 * @since 3.0.0
 */
export type WithoutMetadata = {
  identifier: InjectableIdentifier;
  value: InjectableFinalValue;
  type: 'PROPERTY' | 'PARAM';
  property?: Record<string, string>;
};

/**
 * @since 3.0.0
 */
export type WithMetadata<Metadata extends IdentifierMetadata> = {
  identifier: InjectableIdentifier;
  value: InjectableFinalValue;
  type: 'PROPERTY' | 'PARAM';
  metadata: Metadata;
  property?: Record<string, string>;
};

/**
 * @since 3.0.0
 */
export type ClassInjectable<
  Metadata extends IdentifierMetadata = never,
  TIdentifier extends InjectableIdentifier = InjectableIdentifier,
> = TIdentifier extends Type ? WithoutMetadata : WithMetadata<Metadata>;

/**
 * @since 3.0.0
 */
export interface AutomockDependenciesAdapter {
  inspect(
    targetClass: Type
  ): InjectablesRegistry & { scope?: 'REQUEST' | 'SINGLETON' | 'TRANSIENT' };
}

/**
 * @since 3.0.0
 */
export type IdentifierMetadata = Record<string | symbol, never>;

/**
 * @since 3.0.0
 */
export interface InjectablesRegistry {
  readonly scope?: 'REQUEST' | 'SINGLETON' | 'TRANSIENT';
  resolve<T extends IdentifierMetadata>(
    identifier: InjectableIdentifier,
    metadata?: IdentifierMetadata
  ): ClassInjectable<T> | undefined;
  list<T extends IdentifierMetadata>(): ClassInjectable<T>[] | [];
}
