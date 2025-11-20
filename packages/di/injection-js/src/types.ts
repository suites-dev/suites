/**
 * Identifier metadata for injection-js adapter.
 * Represents parameter decorators like @Inject(), @Optional(), @Self(), @SkipSelf(), @Host()
 */
export interface InjectionJsParameterMetadata {
  token?: unknown;
  optional?: boolean;
  self?: boolean;
  skipSelf?: boolean;
  host?: boolean;
}

export type IdentifierMetadata = InjectionJsParameterMetadata;
