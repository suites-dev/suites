/**
 * Identifier metadata for injection-js adapter.
 * Only includes the token from @Inject(token) decorator.
 *
 * The token is included in metadata (even though it's redundant with identifier)
 * because Suites core uses the presence of metadata to distinguish between:
 * - Token-based injection (has metadata) - should be auto-mocked
 * - Primitive values (no metadata) - requires .final()
 *
 * Note: @Optional(), @Self(), @SkipSelf(), @Host() decorators are ignored
 * as they are production DI resolution hints that don't affect the flat
 * virtual test container used in Suites.
 */
export interface InjectionJsParameterMetadata {
  token?: unknown;
}

export type IdentifierMetadata = InjectionJsParameterMetadata;
