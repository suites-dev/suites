import { InjectionJsParameterMetadata } from './src/types';

declare module '@suites/types.di' {
  /**
   * InjectionJS-specific identifier metadata override.
   * @since 3.0.1
   */
  export type IdentifierMetadata = InjectionJsParameterMetadata;
}
