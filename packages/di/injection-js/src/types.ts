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
 * Type guard to check if a decorator is an @Inject decorator
 */
export function isInjectDecorator(decorator: unknown): decorator is InjectDecorator {
  return (
    typeof decorator === 'object' &&
    decorator !== null &&
    'token' in decorator &&
    (decorator as InjectDecorator).token !== undefined
  );
}

/**
 * Union type for parameter decorators array items.
 * Can be:
 * - An annotation instance (object with metadata)
 * - A Type function (when used without parentheses)
 * - null (for parameters without decorators, used as padding)
 */
export type ParameterDecorator = InjectionJsDecorator | Function | null;

export type IdentifierMetadata = never;
