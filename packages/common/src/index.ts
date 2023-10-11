import { Type } from '@automock/types';

/**
 * @since 2.2.0
 */
export const UndefinedDependency: unique symbol = Symbol('UndefinedDependency');
export type UndefinedDependencySymbol = typeof UndefinedDependency;

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
export type InjectableValue = ConstantValue | Type | UndefinedDependencySymbol;

/**
 * @since 3.0.0
 */
export type WithoutMetadata = {
  identifier: InjectableIdentifier;
  value: InjectableValue;
  type: 'PROPERTY' | 'PARAM';
  property?: Record<string, string>;
};

/**
 * @since 3.0.0
 */
export type WithMetadata<Metadata extends IdentifierMetadata> = {
  identifier: string | symbol;
  value: InjectableValue;
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
  reflect(targetClass: Type): ClassInjectablesContainer;
}

/**
 * @since 3.0.0
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IdentifierMetadata {}

/**
 * @since 3.0.0
 */
export interface ClassInjectablesContainer {
  resolve<T extends IdentifierMetadata>(
    identifier: InjectableIdentifier,
    metadata?: IdentifierMetadata
  ): ClassInjectable<T> | undefined;
  list<T extends IdentifierMetadata>(): ClassInjectable<T>[] | [];
}
