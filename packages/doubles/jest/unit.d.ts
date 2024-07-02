/// <reference types="jest" />
import type { DeepPartial, Type } from '@suites/types.common';
import type { InjectableIdentifier, IdentifierMetadata } from '@suites/types.di';
import type { TestBedBuilder } from '@suites/core.unit';
import type { Mocked as JestMocked, Stub as JestStub } from '@suites/doubles.jest';
import type { ArgsType } from '@suites/types.doubles';

declare module '@suites/unit' {
  /**
   * Represents a stub function
   *
   * @since 3.0.0
   * functions replaced by stubs.
   * @alias jest.Mock
   * @see https://jestjs.io/docs/mock-function-api#jestfnimplementation
   * @see https://suites.dev/docs/api-reference
   */
  export type Stub<T = any, TArgs extends any[] = any[]> = JestStub<T, TArgs>;

  /**
   * Represents a mocked instance of a given type.
   *
   * @since 3.0.0
   * @template TType - The object type being mocked.
   * @see https://jestjs.io/docs/jest-object#jestmockedsource
   * @see https://suites.dev/docs/api-reference
   */
  export type Mocked<T> = JestMocked<T>;

  /**
   * Interface to define overrides for mocking dependencies in a test environment.
   *
   * @template TDependency The type of the dependency to be mocked.
   * @template TClass The type of the class under test.
   * @see https://suites.dev/api-reference/api/mockoverride-api
   */
  export interface MockOverride<TDependency, TClass> {
    /**
     * Specifies the mock implementation to be used for the mocked dependency.
     *
     * @since 3.0.0
     * @param mockImplementation - The mock implementation for the mocked dependency.
     * @returns `TestBedBuilder` instance for chaining further configuration.
     */
    impl(
      mockImplementation: (
        stubFn: () => Stub<any, ArgsType<TDependency>>
      ) => DeepPartial<TDependency>
    ): TestBedBuilder<TClass>;

    /**
     * Specifies the final implementation to be used for the mocked dependency.
     *
     * @since 3.0.0
     * @param finalImplementation - The final implementation for the mocked dependency.
     * @returns `TestBedBuilder` instance for chaining further configuration.
     */
    final(finalImplementation: DeepPartial<TDependency>): TestBedBuilder<TClass>;
  }
}

declare module '@suites/core.unit' {
  /**
   * The UnitReference interface represents a reference to a unit object.
   * It provides methods to retrieve mocked objects of dependencies based
   * on their type or identifier. This extension integrates Jest mocking capabilities.
   *
   * @since 3.0.0
   * @see https://suites.dev/docs/api-reference
   */
  export interface UnitReference {
    get<TDependency>(token: string): JestMocked<TDependency>;

    get<TDependency>(
      token: string,
      identifierMetadata: IdentifierMetadata
    ): JestMocked<TDependency>;

    get<TDependency>(token: symbol): JestMocked<TDependency>;

    get<TDependency>(
      token: symbol,
      identifierMetadata: IdentifierMetadata
    ): JestMocked<TDependency>;

    get<TDependency>(type: Type<TDependency>): JestMocked<TDependency>;

    get<TDependency>(
      type: Type<TDependency>,
      identifierMetadata: IdentifierMetadata
    ): JestMocked<TDependency>;

    get<TDependency>(
      identifier: Type<TDependency> | string | symbol,
      identifierMetadata?: IdentifierMetadata
    ): JestMocked<TDependency>;

    get<TDependency>(
      identifier: InjectableIdentifier<TDependency>,
      identifierMetadata?: IdentifierMetadata
    ): JestMocked<TDependency>;
  }
}
