import type { Type, ConstantValue } from '@suites/types.common';

export * from './errors';

/**
 * @since 2.2.0
 */
export const UndefinedDependency: unique symbol = Symbol('UndefinedDependency');
export type UndefinedDependencySymbol = typeof UndefinedDependency;

/**
 * @since 3.0.0
 */
export type InjectableIdentifier<TClass = unknown> = Type<TClass> | string | symbol;

/**
 * @since 3.0.0
 */
export type InjectableReflectedType = ConstantValue | Type | undefined;

/**
 * @since 3.0.0
 */
export type InjectableFinalValue = ConstantValue | Type | UndefinedDependencySymbol;

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
export interface DependencyInjectionAdapter {
  inspect(targetClass: Type): InjectableRegistry;
}

/**
 * @since 3.0.0
 */
export type IdentifierMetadata = Record<string | symbol, unknown>;

/**
 * @since 3.0.0
 */
export interface InjectableRegistry {
  resolve<T extends IdentifierMetadata>(
    identifier: InjectableIdentifier,
    metadata?: IdentifierMetadata
  ): ClassInjectable<T> | undefined;
  list<T extends IdentifierMetadata>(): ClassInjectable<T>[] | [];
}
