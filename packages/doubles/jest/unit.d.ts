/// <reference types="jest" />
import type { DeepPartial, Type } from '@suites/types.common';
import type { IdentifierMetadata } from '@suites/types.di';
import type { TestBedBuilder } from '@suites/core.unit';
import type { Mocked as JestMocked, Stub as JestStub } from '.';
import type { ArgsType } from '@suites/types.doubles';

declare module '@suites/unit' {
  /**
   * Represents a stub function that can be configured to return specific values
   * and track how it was called during testing.
   *
   * This is the base abstraction for test doubles that replace functions.
   * Testing adapters augment this interface with their specific capabilities
   * such as call tracking, return value configuration, and behavior verification.
   *
   * @template ReturnType The type that the stub function returns
   * @template Args The tuple type of the function's arguments
   * @since 3.0.0
   */
  export type Stub<TArgs extends any[] = any[]> = JestStub<TArgs>;

  /**
   * Represents a test double instance where all methods and properties are stubbed.
   *
   * This abstract type provides the foundation for creating test doubles in unit tests.
   * When a testing adapter is installed, this type is automatically augmented with
   * framework-specific capabilities through TypeScript module augmentation.
   *
   * @template T The type of the object being transformed into a test double
   *
   * @remarks
   * This is a base abstraction that adapters enhance with concrete implementations.
   * The actual runtime behavior depends on which testing adapter is installed.
   *
   * @since 3.0.0
   * @see {@link https://suites.dev/docs/api-reference/types | Type Reference}
   */
  export type Mocked<T> = JestMocked<T>;
}

declare module '@suites/core.unit' {
  /**
   * Provides access to mocked dependencies in the test environment.
   *
   * The `unitRef` allows you to retrieve mocked instances of dependencies
   * to configure their behavior or verify interactions. This is essential for
   * controlling how mocked dependencies respond during tests.
   *
   * The return type of `.get()` is augmented by adapter packages to provide
   * framework-specific mock types. Configure augmentation by referencing the
   * adapter's unit.d.ts in your global.d.ts.
   *
   * @since 3.0.0
   * @see {@link https://suites.dev/docs/api-reference/unit-reference | UnitReference API Reference}
   *
   * @example
   * ```ts
   * import { TestBed } from '@suites/unit';
   *
   * const { unit, unitRef } = await TestBed.solitary(MyService).compile();
   *
   * // Get a mocked dependency
   * const mockLogger = unitRef.get(Logger);
   * mockLogger.log.mockReturnValue('test');
   *
   * // Verify interactions
   * unit.doSomething();
   * expect(mockLogger.log).toHaveBeenCalled();
   * ```
   */
  export interface UnitReference {
    /**
     * Retrieves a reference to the mocked object of a dependency corresponding to its type identifier.
     *
     * @since 3.0.0
     * @template TDependency The type of the dependency being retrieved.
     * @param type - The type representing the dependency.
     * @throws {@link DependencyResolutionError} If the dependency is not found.
     * @returns The mocked object corresponding to the provided type identifier.
     */
    get<TDependency>(type: Type<TDependency>): JestMocked<TDependency>;

    /**
     * Retrieves a reference to the mocked object of a dependency corresponding to its type identifier
     * and metadata object.
     *
     * @since 3.0.0
     * @template TDependency The type of the dependency being retrieved.
     * @param type - The type representing the dependency.
     * @param identifierMetadata - A metadata object that corresponds to the type identifier.
     * @throws {@link DependencyResolutionError} If the dependency is not found.
     * @returns The mocked object corresponding to the provided
     * symbol-based token.
     */
    get<TDependency>(
      type: Type<TDependency>,
      identifierMetadata: IdentifierMetadata
    ): JestMocked<TDependency>;

    /**
     * Retrieves a reference to the mocked object of a dependency corresponding to a string-based token.
     *
     * @since 3.0.0
     * @template TDependency The type of the dependency being retrieved.
     * @param token - The string-based token representing the dependency.
     * @throws {@link DependencyResolutionError} If the dependency is not found.
     * @returns The mocked object corresponding to the provided string-based token.
     */
    get<TDependency>(token: string): JestMocked<TDependency>;

    /**
     * Retrieves a reference to the mocked object of a dependency corresponding to a string-based
     * token and an identifier metadata object.
     *
     * @since 3.0.0
     * @template TDependency The type of the dependency being retrieved.
     * @param token - The symbol-based token representing the dependency.
     * @param identifierMetadata - An accompanying metadata object for the token identifier.
     * @throws {@link DependencyResolutionError} If the dependency is not found.
     * @returns The mocked object corresponding to the provided
     * symbol-based token.
     */
    get<TDependency>(
      token: string,
      identifierMetadata: IdentifierMetadata
    ): JestMocked<TDependency>;

    /**
     * Retrieves a reference to the mocked object of a dependency corresponding to a symbol-based token.
     *
     * @since 3.0.0
     * @template TDependency The type of the dependency being retrieved.
     * @param token - The symbol-based token representing the dependency.
     * @throws {@link DependencyResolutionError} If the dependency is not found.
     * @returns The mocked object corresponding to the provided symbol-based token.
     */
    get<TDependency>(token: symbol): JestMocked<TDependency>;

    /**
     * Retrieves a reference to the mocked object of a dependency corresponding to a symbol-based
     * token and an identifier metadata object.
     *
     * @since 3.0.0
     * @template TDependency The type of the dependency being retrieved.
     * @param token - The symbol-based token representing the dependency.
     * @param identifierMetadata - An accompanying metadata object for the token identifier.
     * @throws {@link DependencyResolutionError} If the dependency is not found.
     * @returns The mocked object corresponding to the provided symbol-based token.
     */
    get<TDependency>(
      token: symbol,
      identifierMetadata: IdentifierMetadata
    ): JestMocked<TDependency>;

    /**
     * Retrieves a mocked dependency by its type, string, or symbol token with optional metadata.
     *
     * This method provides flexibility in retrieving dependencies by allowing various identifier types.
     *
     * @since 3.0.0
     * @template TDependency The type of the dependency being retrieved.
     * @param identifier - The token representing the dependency. It can be of type `Type<TDependency>`, `string`, or `symbol`.
     * @param identifierMetadata - A corresponding metadata object for the token identifier.
     * @throws {@link DependencyResolutionError} If the dependency is not found.
     * @returns The mocked instance corresponding to the provided identifier and metadata.
     */
    get<TDependency>(
      identifier: Type<TDependency> | string | symbol,
      identifierMetadata?: IdentifierMetadata
    ): JestMocked<TDependency>;
  }

  /**
   * Interface to define overrides for mocking dependencies in a test environment.
   *
   * @see {@link https://suites.dev/docs/api-reference/mock-configuration | Mock Configuration}
   * @template TDependency The type of the dependency to be mocked.
   * @template TClass The type of the class under test.
   */
  export interface MockOverride<TDependency, TClass> {
    /**
     * Provides a mock implementation using stub functions for methods.
     *
     * Use this when you need fine-grained control over method behavior with stub functions.
     * The stub function is automatically provided for creating mocked methods.
     *
     * @see {@link https://suites.dev/docs/api-reference/mock-configuration | Mock Configuration}
     * @since 3.0.0
     * @param mockImplementation - Function that receives a stub creator and returns the mock
     * @returns A TestBedBuilder instance for chaining
     *
     * @example
     * ```ts
     * await TestBed.solitary(MyService)
     *   .mock(Logger)
     *   .impl((stub) => ({ log: stub().mockReturnValue(undefined) }))
     *   .compile();
     * ```
     */
    impl(
      mockImplementation: (
        stubFn: () => JestStub<ArgsType<TDependency>>
      ) => DeepPartial<TDependency>
    ): TestBedBuilder<TClass>;

    /**
     * Provides a final implementation with concrete values or functions.
     *
     * Use this when you want to directly provide the mock implementation without stubs,
     * useful for simple mocks or when providing constant values.
     *
     * @see {@link https://suites.dev/docs/api-reference/mock-configuration | Mock Configuration}
     * @since 3.0.0
     * @param finalImplementation - The mock implementation object
     * @returns A TestBedBuilder instance for chaining
     *
     * @example
     * ```ts
     * await TestBed.solitary(MyService)
     *   .mock('CONFIG')
     *   .final({ apiUrl: 'http://test.api', timeout: 5000 })
     *   .compile();
     * ```
     */
    final(finalImplementation: DeepPartial<TDependency>): TestBedBuilder<TClass>;
  }
}
