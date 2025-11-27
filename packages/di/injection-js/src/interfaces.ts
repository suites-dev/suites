import type { Type } from '@suites/types.common';

/**
 * Represents decorator metadata objects stored by injection-js.
 * These are annotation instances created by makeParamDecorator.
 */
export interface InjectionJsDecorator {
  /** ngMetadataName identifies the decorator type (e.g., 'Inject', 'Optional') */
  ngMetadataName?: string;
  /** toString method for decorator representation */
  toString?: () => string;
}

/**
 * Metadata for @Inject(token) decorator
 */
export interface InjectDecorator extends InjectionJsDecorator {
  token: unknown;
}

/**
 * Union type for parameter decorators array items.
 * Can be:
 * - An annotation instance (object with metadata from @Inject, @Optional, etc.)
 * - A Type constructor (class reference when used without parentheses)
 * - null (for parameters without decorators, used as padding)
 */
export type ParameterDecorator = InjectionJsDecorator | Type | null;

export type IdentifierMetadata = never;
