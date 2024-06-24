/// <reference types="@vitest/spy" />
import type { DeepPartial, Type } from '@suites/types.common';
import type { IdentifierMetadata } from '@suites/types.di';
import type { Mocked as VitestMocked, Stub as VitestStub } from '@suites/doubles.vitest';
import type { TestBedBuilder } from '@suites/core.unit';

declare module '@suites/unit' {
  /**
   * Represents a stub function
   *
   * @since 3.0.0
   * functions replaced by stubs.
   * @alias Mock
   * @see https://suites.dev/docs/api-reference
   */
  export type Stub<T = any> = VitestStub<T>;

  /**
   * Represents a mocked instance of a given type.
   *
   * @since 3.0.0
   * @template TType - The object type being mocked.
   * @see https://suites.dev/docs/api-reference
   */
  export type Mocked<T> = VitestMocked<T>;
  /**
   * The UnitReference interface represents a reference to a unit object.
   * It provides methods to retrieve mocked objects of dependencies based
   * on their type or identifier. This extension integrates Vitest mocking capabilities.
   *
   * @since 3.0.0
   * @see https://suites.dev/docs/api-reference
   */
  export interface UnitReference {
    /**
     * Retrieves a reference to the mocked object of a dependency corresponding to a
     * string-based token.
     *
     * @since 3.0.0
     * @template TDependency The type of the dependency being retrieved.
     * @param token The string-based token representing the dependency.
     * @throws {IdentifierNotFoundError} If the dependency is not found.
     * @returns {Mocked<TDependency>} The mocked object corresponding to the provided string-based token.
     * @see https://suites.dev/docs/api-reference
     * @example
     * const mockedService = unitRef.get<MyService>('MY_SERVICE_TOKEN');
     */
    get<TDependency>(token: string): VitestMocked<TDependency>;

    /**
     * Retrieves a reference to the mocked object of a dependency corresponding to its
     * string-based identifier and the identifier metadata.
     *
     * @since 3.0.0
     * @template TDependency The type of the dependency being retrieved.
     * @param token The string-based token representing the dependency.
     * @param identifierMetadata An accompanying metadata object for the token identifier.
     * @throws {IdentifierNotFoundError} If the dependency is not found.
     * @returns {Mocked<TDependency>} The mocked object corresponding to the provided string-based token and identifier metadata.
     * @see https://suites.dev/docs/api-reference
     * @example
     * const mockedService = unitRef.get<MyService>('MyService', metadata);
     */
    get<TDependency>(
      token: string,
      identifierMetadata: IdentifierMetadata
    ): VitestMocked<TDependency>;

    /**
     * Retrieves a reference to the mocked object of a dependency corresponding to a
     * symbol-based token.
     *
     * @since 3.0.0
     * @template TDependency The type of the dependency being retrieved.
     * @param token The symbol-based token representing the dependency.
     * @throws {IdentifierNotFoundError} If the dependency is not found.
     * @returns {Mocked<TDependency>} The mocked object corresponding to the provided symbol-based token.
     * @see https://suites.dev/docs/api-reference
     * @example
     * const mockedService = unitRef.get<MyService>(MY_SERVICE_SYMBOL);
     */
    get<TDependency>(token: symbol): VitestMocked<TDependency>;

    /**
     * Retrieves a reference to the mocked object of a dependency corresponding to its
     * symbol-based identifier and the identifier metadata.
     *
     * @since 3.0.0
     * @template TDependency The type of the dependency being retrieved.
     * @param token The symbol-based token representing the dependency.
     * @param identifierMetadata An accompanying metadata object for the token identifier.
     * @throws {IdentifierNotFoundError} If the dependency is not found.
     * @returns {Mocked<TDependency>} The mocked object corresponding to the provided symbol-based token and identifier metadata.
     * @see https://suites.dev/docs/api-reference
     * @example
     * const mockedService = unitRef.get<MyService>(MY_SERVICE_SYMBOL, metadata);
     */
    get<TDependency>(
      token: symbol,
      identifierMetadata: IdentifierMetadata
    ): VitestMocked<TDependency>;

    /**
     * Retrieves a reference to the mocked object of a dependency corresponding
     * to its type identifier.
     *
     * @since 3.0.0
     * @template TDependency The type of the dependency being retrieved.
     * @param type The type representing the dependency.
     * @throws {IdentifierNotFoundError} If the dependency is not found.
     * @returns {Mocked<TDependency>} The mocked object corresponding to the provided type identifier.
     * @see https://suites.dev/docs/api-reference
     * @example
     * const mockedService = unitRef.get<MyService>(MyService);
     */
    get<TDependency>(type: Type<TDependency>): Mocked<TDependency>;

    /**
     * Retrieves a reference to the mocked object of a dependency corresponding to its
     * type identifier and the identifier metadata.
     *
     * @since 3.0.0
     * @template TDependency The type of the dependency being retrieved.
     * @param type The type representing the dependency.
     * @param identifierMetadata An accompanying metadata object for the token identifier.
     * @throws {IdentifierNotFoundError} If the dependency is not found.
     * @returns {Mocked<TDependency>} The mocked object corresponding to the provided type identifier and identifier metadata.
     * @see https://suites.dev/docs/api-reference
     * @example
     * const mockedService = unitRef.get<MyService>(MyService, metadata);
     */
    get<TDependency>(
      type: Type<TDependency>,
      identifierMetadata: IdentifierMetadata
    ): VitestMocked<TDependency>;

    /**
     * Retrieves a reference to the mocked object of a dependency corresponding to its
     * type, string-based or symbol-based identifier and the identifier metadata if present.
     *
     * @since 3.0.0
     * @template TDependency The type of the dependency being retrieved.
     * @param identifier The type or token that the dependency corresponds to.
     * @param identifierMetadata An accompanying metadata object for the token identifier.
     * @throws {IdentifierNotFoundError} If the dependency is not found.
     * @returns {Mocked<TDependency>} The mocked object corresponding to the provided identifier, along with any available identifier metadata.
     * @see https://suites.dev/docs/api-reference
     * @example
     * const mockedService = unitRef.get<MyService>(MyService, metadata);
     * // or
     * const mockedService = unitRef.get<MyService>('MY_SERVICE_TOKEN');
     * // or
     * const mockedService = unitRef.get<MyService>(MY_SERVICE_SYMBOL, metadata);
     */
    get<TDependency>(
      identifier: Type<TDependency> | string | symbol,
      identifierMetadata?: IdentifierMetadata
    ): VitestMocked<TDependency>;
  }

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
      mockImplementation: (stubFn: () => Stub<TDependency>) => DeepPartial<TDependency>
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