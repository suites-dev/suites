declare module '@suites/types.di' {
  /**
   * Inversify-specific identifier metadata override.
   *
   * Inversify uses metadata for dependency resolution, maintaining compatibility
   * with Inversify's decorator-based dependency injection system.
   *
   * @since 4.0.0
   */
  export type IdentifierMetadata = Record<string | symbol, unknown>;
}
