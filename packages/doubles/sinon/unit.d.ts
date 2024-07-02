/// <reference types="@types/sinon" />
import type { DeepPartial, Type } from '@suites/types.common';
import type { InjectableIdentifier, IdentifierMetadata } from '@suites/types.di';
import type { TestBedBuilder } from '@suites/core.unit';
import type { Mocked as SinonMocked, Stub as SinonStub } from '@suites/doubles.sinon';
import type { ArgsType } from '@suites/types.doubles';

declare module '@suites/unit' {
  /**
   * Represents a stub function typically used in testing to replace other functions or methods.
   * This type extends SinonStub to leverage Sinon's built-in mocking capabilities.
   *
   * @since 3.0.0
   * @template TArgs The arguments type of the stub function.
   * @alias {SinonStub}
   * @see https://suites.dev/docs/api-reference
   */
  export type Stub<TArgs extends any[]> = SinonStub<TArgs>;

  /**
   * Represents a mocked instance of a given type, using Sinon's mocking framework.
   * This is particularly useful for creating mocked instances of classes or objects in a testing environment.
   *
   * @since 3.0.0
   * @template T The type of the object being mocked.
   * @see https://sinonjs.org/releases/latest/stubs
   * @see https://suites.dev/docs/api-reference
   */
  export type Mocked<TType> = SinonMocked<TType>;
}

declare module '@suites/core.unit' {
  /**
   * The UnitReference interface represents a reference to a unit object.
   * It provides methods to retrieve mocked objects of dependencies based
   * on their type or identifier. This extension integrates Sinon mocking capabilities,
   * offering a flexible approach to access and manipulate mocked dependencies within unit tests.
   *
   * @since 3.0.0
   * @see https://suites.dev/docs/api-reference
   */
  export interface UnitReference {
    /**
     * Retrieves a mocked instance of a dependency based on a string token.
     * This method allows fetching mocks based on unique identifiers, facilitating tests where dependencies are
     * identified by strings.
     *
     * @template TDependency The type of the dependency being retrieved.
     * @param token The string-based token representing the dependency.
     * @returns The mocked object corresponding to the provided string-based token.
     * @since 3.0.0
     */
    get<TDependency>(token: string): SinonMocked<TDependency>;

    /**
     * Retrieves a mocked instance of a dependency based on a string token with additional identifier metadata.
     * The metadata can be used to specify more detailed characteristics or requirements for the mock.
     *
     * @template TDependency The type of the dependency being retrieved.
     * @param token The string-based token representing the dependency.
     * @param identifierMetadata An accompanying metadata object for the token identifier.
     * @returns The mocked object corresponding to the provided string-based token and identifier metadata.
     * @since 3.0.0
     */
    get<TDependency>(
      token: string,
      identifierMetadata: IdentifierMetadata
    ): SinonMocked<TDependency>;

    /**
     * Retrieves a mocked instance of a dependency based on a symbol-based token.
     * Symbols are used as unique and immutable identifiers, suitable for cases where collisions in names are a concern.
     *
     * @template TDependency The type of the dependency being retrieved.
     * @param token The symbol-based token representing the dependency.
     * @returns The mocked object corresponding to the provided symbol-based token.
     * @since 3.0.0
     */
    get<TDependency>(token: symbol): SinonMocked<TDependency>;

    /**
     * Retrieves a mocked instance of a dependency based on a symbol token with additional identifier metadata.
     * Metadata provides further customization or configuration of the mocked instance.
     *
     * @template TDependency The type of the dependency being retrieved.
     * @param token The symbol-based token representing the dependency.
     * @param identifierMetadata An accompanying metadata object for the token identifier.
     * @returns The mocked object corresponding to the provided symbol-based token and identifier metadata.
     * @since 3.0.0
     */
    get<TDependency>(
      token: symbol,
      identifierMetadata: IdentifierMetadata
    ): SinonMocked<TDependency>;

    /**
     * Retrieves a mocked instance of a dependency based on its type.
     * This approach is type-safe and ensures that the retrieved mock matches the expected dependency type.
     *
     * @template TDependency The type of the dependency being retrieved.
     * @param type The type representing the dependency.
     * @returns The mocked object corresponding to the provided type identifier.
     * @since 3.0.0
     */
    get<TDependency>(type: Type<TDependency>): SinonMocked<TDependency>;

    /**
     * Retrieves a mocked instance of a dependency based on its type with additional identifier metadata.
     * This allows for more precise and context-specific mocking based on both type and metadata.
     *
     * @template TDependency The type of the dependency being retrieved.
     * @param type The type representing the dependency.
     * @param identifierMetadata An accompanying metadata object for the type identifier.
     * @returns The mocked object corresponding to the provided type identifier and identifier metadata.
     * @since 3.0.0
     */
    get<TDependency>(
      type: Type<TDependency>,
      identifierMetadata: IdentifierMetadata
    ): SinonMocked<TDependency>;

    /**
     * Retrieves a mocked instance of a dependency using a flexible identifier, which can be a type, string, or symbol.
     * This method provides the ultimate flexibility in retrieving mocked dependencies, accommodating various
     * identification strategies.
     *
     * @template TDependency The type of the dependency being retrieved.
     * @param identifier The identifier (type, string, or symbol) of the dependency.
     * @param identifierMetadata Optional accompanying metadata object for the identifier.
     * @returns The mocked instance corresponding to the provided identifier, along with any available identifier
     * metadata.
     * @since 3.0.0
     */
    get<TDependency>(
      identifier: Type<TDependency> | string | symbol,
      identifierMetadata?: IdentifierMetadata
    ): SinonMocked<TDependency>;
  }

  /**
   * Interface defining methods for configuring mock overrides in unit testing environments.
   * This allows detailed setup of mock behavior for dependencies of the class under test.
   *
   * @since 3.0.0
   * @template TDependency The type of the dependency to be mocked.
   * @template TClass The type of the class under test.
   * @see https://suites.dev/api-reference/api/mockoverride-api
   */
  export interface MockOverride<TDependency, TClass> {
    /**
     * Specifies the mock implementation for a dependency. This is used to override the default behavior
     * or setup-specific scenarios in tests.
     *
     * @param mockImplementation The function that defines the mock behavior. It takes a function returning a
     * Sinon Stub and should return a partial implementation of the dependency.
     * @returns {TestBedBuilder} A TestBedBuilder instance for chaining further configuration, allowing for fluent API style.
     * @since 3.0.0
     */
    impl(
      mockImplementation: (
        stubFn: () => SinonStub<ArgsType<TDependency>>
      ) => DeepPartial<TDependency>
    ): TestBedBuilder<TClass>;

    /**
     * Specifies the final, concrete implementation to use for a mocked dependency, effectively replacing any previous
     * mock setups.
     *
     * @param {DeepPartial} finalImplementation The concrete implementation for the dependency, typically used when transitioning
     * from mock to real objects.
     * @returns {TestBedBuilder} A TestBedBuilder instance for chaining further configuration.
     * @since 3.0.0
     */
    final(finalImplementation: DeepPartial<TDependency>): TestBedBuilder<TClass>;
  }
}
