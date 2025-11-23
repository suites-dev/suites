/**
 * Identifier metadata for injection-js adapter.
 *
 * Set to `never` because injection-js adapter does not include metadata.
 * The token from @Inject(token) is used directly as the identifier, and
 * Suites core distinguishes mockable dependencies from primitives using
 * the `value` field (Type = mockable, UndefinedDependency = needs .final()).
 *
 * Note: @Optional(), @Self(), @SkipSelf(), @Host() decorators are ignored
 * as they are production DI resolution hints that don't affect the flat
 * virtual test container used in Suites.
 */
export type IdentifierMetadata = never;
