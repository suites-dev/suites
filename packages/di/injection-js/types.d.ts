import { InjectionJsParameterMetadata } from './src/types';

declare module '@suites/types.di' {
  /**
   * NestJS-specific identifier metadata override.
   *
   * NestJS adapters don't use additional metadata for dependency resolution,
   * so this is typed as never to reflect that no metadata is needed.
   *
   * @since 4.0.0
   */
  export type IdentifierMetadata = InjectionJsParameterMetadata;
}