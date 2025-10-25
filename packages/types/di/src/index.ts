import type { Type, ConstantValue } from '@suites/types.common';

export * from './errors';

/**
 * Symbol used to mark dependencies that could not be resolved during reflection.
 *
 * @since 2.2.0
 */
export const UndefinedDependency: unique symbol = Symbol('UndefinedDependency');

/**
 * Type representing the `UndefinedDependency` symbol.
 *
 * @since 2.2.0
 */
export type UndefinedDependencySymbol = typeof UndefinedDependency;

/**
 * Represents an identifier used for dependency injection.
 *
 * Can be a class constructor, a string token, or a symbol token, providing flexibility
 * in how dependencies are identified and injected.
 *
 * @template TClass The class type when using class-based injection
 * @since 3.0.0
 */
export type InjectableIdentifier<TClass = unknown> = Type<TClass> | string | symbol;

/**
 * Represents the type information reflected from a dependency during inspection.
 *
 * May be a constant value, a class type, or undefined if reflection failed.
 *
 * @since 3.0.0
 */
export type InjectableReflectedType = ConstantValue | Type | undefined;

/**
 * Represents the final resolved value of an injectable dependency.
 *
 * Can be a constant value, a class type, or the UndefinedDependency symbol
 * if the dependency could not be resolved.
 *
 * @since 3.0.0
 */
export type InjectableFinalValue = ConstantValue | Type | UndefinedDependencySymbol;

/**
 * Represents an injectable dependency without additional metadata.
 *
 * Used for simple class-based dependencies that don't require extra configuration
 * or metadata from the DI framework.
 *
 * @since 3.0.0
 */
export type WithoutMetadata = {
  identifier: InjectableIdentifier;
  value: InjectableFinalValue;
  type: 'PROPERTY' | 'PARAM';
  property?: Record<string, string>;
};

/**
 * Represents an injectable dependency with additional metadata.
 *
 * Used for token-based dependencies (strings, symbols) that include metadata
 * from the DI framework, such as injection decorators or qualifiers.
 *
 * @template Metadata The type of metadata attached to this dependency
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
 * Represents a dependency that can be injected into a class.
 *
 * Conditionally includes metadata based on whether the identifier is a class type
 * or a token (string/symbol).
 *
 * @template Metadata The type of metadata when using token-based injection
 * @template TIdentifier The type of identifier used
 * @since 3.0.0
 */
export type ClassInjectable<
  Metadata extends IdentifierMetadata = never,
  TIdentifier extends InjectableIdentifier = InjectableIdentifier,
> = TIdentifier extends Type ? WithoutMetadata : WithMetadata<Metadata>;

/**
 * Adapter interface that DI frameworks must implement to work with Suites.
 *
 * This abstraction allows Suites to work with different DI frameworks (Inversify, NestJS, etc.)
 * by providing a consistent interface for inspecting class dependencies.
 *
 * @since 3.0.0
 */
export interface DependencyInjectionAdapter {
  /**
   * Inspects a class and returns its injectable dependencies.
   *
   * @param targetClass The class to inspect
   * @returns Registry containing the class's dependencies
   */
  inspect(targetClass: Type): InjectableRegistry;
}

/**
 * Metadata attached to injectable identifiers by DI frameworks.
 *
 * Contains framework-specific information about how a dependency should be injected,
 * such as qualifiers, scopes, or other decorator metadata.
 *
 * @since 3.0.0
 */
export type IdentifierMetadata = Record<string | symbol, unknown>;

/**
 * Registry interface for resolving and listing injectable dependencies.
 *
 * Provides methods to query dependencies discovered during class inspection.
 *
 * @since 3.0.0
 */
export interface InjectableRegistry {
  /**
   * Resolves a specific dependency by its identifier and optional metadata.
   *
   * @template T The type of metadata
   * @param identifier The dependency identifier
   * @param metadata Optional metadata for resolution
   * @returns The resolved injectable or undefined if not found
   */
  resolve<T extends IdentifierMetadata>(
    identifier: InjectableIdentifier,
    metadata?: IdentifierMetadata
  ): ClassInjectable<T> | undefined;

  /**
   * Lists all injectable dependencies in the registry.
   *
   * @template T The type of metadata
   * @returns Array of all injectables
   */
  list<T extends IdentifierMetadata>(): ClassInjectable<T>[] | [];
}
