import type { ClassInjectable } from '@suites/types.di';
import type { Type } from '@suites/types.common';
import type { interfaces } from 'inversify';

/**
 * Metadata interface for InversifyJS injectable dependencies.
 *
 * @template T The service identifier type
 * @since 3.0.0
 * @see {@link https://inversify.io/docs/fundamentals/metadata | InversifyJS Metadata}
 */
export interface InversifyInjectableMetadata<T extends interfaces.ServiceIdentifier<T> = never>
  extends interfaces.Metadata {
  /** The metadata key type (inject, multi_inject, or custom) */
  key: 'inject' | 'multi_inject' | string;
  /** The service identifier or lazy reference */
  value: T | unknown | LazyServiceIdentifierToken;
}

/**
 * Represents a lazy service identifier that can be unwrapped at runtime.
 * Used for handling circular dependencies in InversifyJS.
 *
 * @since 3.0.0
 */
export type LazyServiceIdentifierToken = { unwrap: () => Type | string | undefined };

/**
 * Type alias for the Reflect metadata API.
 *
 * @since 3.0.0
 */
export type MetadataReflector = typeof Reflect;

/**
 * Metadata type for InversifyJS class injectables.
 *
 * @since 3.0.0
 */
export type InversifyInjectableIdentifierMetadata = ClassInjectable<Record<string | symbol, never>>;

/**
 * Reserved metadata keys used by InversifyJS for injection.
 *
 * @since 3.0.0
 */
export const INVERSIFY_PRESERVED_KEYS: readonly string[] = ['inject', 'multi_inject'] as const;

/**
 * Metadata type for InversifyJS dependency identifiers.
 *
 * InversifyJS supports named and tagged bindings, which use metadata objects
 * with string or symbol keys.
 *
 * @since 3.0.0
 * @see {@link https://inversify.io/docs/fundamentals/named-bindings | Named Bindings}
 * @see {@link https://inversify.io/docs/fundamentals/tagged-bindings | Tagged Bindings}
 */
export type IdentifierMetadata = Record<string | symbol, unknown>;
