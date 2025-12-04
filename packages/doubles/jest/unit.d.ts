/// <reference types="jest" />
import type { DeepPartial, Type } from '@suites/types.common';
import type { IdentifierMetadata } from '@suites/types.di';
import type { TestBedBuilder } from '@suites/core.unit';
import type { Mocked as JestMocked, Stub as JestStub } from '@suites/doubles.jest';
import type { ArgsType } from '@suites/types.doubles';

/**
 * @description
 * Jest Adapter Type Augmentation
 *
 * This file bridges the abstract types from @suites/unit to Jest-specific concrete implementations
 * through TypeScript module augmentation. When this adapter is installed, these augmentations
 * override the base abstract types with Jest's testing framework capabilities.
 *
 * The augmentation boundary:
 * - Base abstractions: StubbedInstance<T>, Stub<T> (from @suites/types.doubles)
 * - Augmented types: JestMocked<T>, jest.Mock (from this adapter)
 * - User imports from @suites/unit and transparently gets Jest types
 */
declare module '@suites/unit' {
  /**
   * Represents a stub function typically used in testing to replace other functions or methods.
   * This type extends jest.Mock to leverage Jest's built-in mocking capabilities.
   *
   * @since 3.0.0
   * @template TArgs The arguments type of the stub function.
   * @alias jest.Mock
   * @see https://jestjs.io/docs/mock-function-api#jestfnimplementation
   * @see https://suites.dev/docs/api-reference
   */
  export type Stub<TArgs extends any[] = any[]> = JestStub<TArgs>;

  /**
   * Jest-specific mocked instance type where all methods are Jest mocks.
   *
   * This augmentation overrides the base `Mocked<T>` type from `@suites/unit`
   * with Jest's concrete mock implementation when the Jest adapter is installed.
   *
   * @template T The type of the object being mocked
   *
   * @remarks
   * This type should be imported from `@suites/unit`, NOT from this package.
   * TypeScript automatically resolves to this Sinon-specific type when the
   * Sinon adapter is installed.
   *
   * @example
   * // ✅ Correct - import from @suites/unit
   * import { Mocked } from '@suites/unit';
   *
   * // ❌ Wrong - do not import from adapter package
   * import { Mocked } from '@suites/doubles.jest';
   *
   * @since 3.0.0
   * @see {@link https://jestjs.io/docs/jest-object#jestmockedtitem-t-deep Jest Mocked}
   * @see {@link https://suites.dev/docs/api-reference/types Type Reference}
   */
  export type Mocked<T> = JestMocked<T>;
}

declare module '@suites/core.unit' {
  /**
   * Provides access to all mocked dependencies of the unit under test.
   *
   * UnitReference is your gateway to retrieve and configure mocked dependencies after
   * TestBed compilation. It allows to set up mock behaviors, verify interactions,
   * and access any dependency that was automatically mocked by TestBed.
   *
   * @remarks
   * - Only mocked dependencies can be retrieved (not exposed ones in sociable mode)
   * - All retrieved mocks are fully typed with Jest's mocking capabilities
   * - Use this to configure mock behavior and assertions after TestBed compilation
   *
   * @example
   * const { unit, unitRef } = await TestBed.solitary(UserService).compile();
   *
   * // Retrieve mocked dependencies
   * const userRepo = unitRef.get(UserRepository);
   * const emailService = unitRef.get(EmailService);
   * const cache = unitRef.get<CacheService>('CACHE_SERVICE'); // Token-based
   *
   * // Configure mock behaviors
   * userRepo.findById.mockResolvedValue(testUser);
   * emailService.sendEmail.mockResolvedValue(true);
   *
   * @since 3.0.0
   * @see {@link https://suites.dev/docs/api-reference/unitreference UnitReference Guide}
   */
  export interface UnitReference {
    /**
     * Retrieves a mocked dependency by string token.
     * Used for token-based injection like `@Inject('CONFIG')`.
     * @example unitRef.get<ConfigService>('CONFIG_SERVICE')
     */
    get<TDependency>(token: string): JestMocked<TDependency>;

    /**
     * Retrieves a mocked dependency by string token with metadata.
     * Used for advanced DI scenarios with additional constraints.
     */
    get<TDependency>(
      token: string,
      identifierMetadata: IdentifierMetadata
    ): JestMocked<TDependency>;

    /**
     * Retrieves a mocked dependency by symbol token.
     * Used when symbols are used as injection tokens for uniqueness.
     * @example unitRef.get<Logger>(LoggerSymbol)
     */
    get<TDependency>(token: symbol): JestMocked<TDependency>;

    /**
     * Retrieves a mocked dependency by symbol token with metadata.
     * Used for advanced DI scenarios with symbol tokens.
     */
    get<TDependency>(
      token: symbol,
      identifierMetadata: IdentifierMetadata
    ): JestMocked<TDependency>;

    /**
     * Retrieves a mocked dependency by its class type.
     * The most common way to get mocked dependencies.
     * @example const userRepo = unitRef.get(UserRepository)
     */
    get<TDependency>(type: Type<TDependency>): JestMocked<TDependency>;

    /**
     * Retrieves a mocked dependency by class type with metadata.
     * Used for advanced DI scenarios with tagged/named dependencies.
     */
    get<TDependency>(
      type: Type<TDependency>,
      identifierMetadata: IdentifierMetadata
    ): JestMocked<TDependency>;

    /**
     * Flexible overload for retrieving mocked dependencies.
     * Accepts class types, string tokens, or symbol tokens.
     */
    get<TDependency>(
      identifier: Type<TDependency> | string | symbol,
      identifierMetadata?: IdentifierMetadata
    ): JestMocked<TDependency>;
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
     * Configures mocks with stubs that can be retrieved and modified later.
     *
     * Use this when you need to change mock behavior after TestBed compilation.
     * The `stubFn` parameter provides Jest stub functions that you can configure,
     * and the resulting mock can be retrieved via `unitRef.get()` for further modifications.
     *
     * @param mockImplementation Function that receives a stub factory and returns partial mock implementation
     * @returns TestBedBuilder for method chaining
     *
     * @remarks
     * - Mocks are retrievable via `unitRef.get()` after compilation
     * - Allows runtime behavior modification during tests
     * - Best for class-based dependencies where you need flexible control
     *
     * @example
     * const { unit, unitRef } = await TestBed.solitary(UserService)
     *   .mock(UserRepository)
     *   .impl(stubFn => ({
     *     findById: stubFn().mockResolvedValue(testUser),
     *     save: stubFn().mockResolvedValue(void 0)
     *   }))
     *   .compile();
     *
     * // Later in test, modify behavior
     * const repo = unitRef.get(UserRepository);
     * repo.findById.mockResolvedValue(differentUser);
     *
     * @since 3.0.0
     */
    impl(
      mockImplementation: (
        stubFn: () => JestStub<ArgsType<TDependency>>
      ) => DeepPartial<TDependency>
    ): TestBedBuilder<TClass>;

    /**
     * Sets immutable final values or behaviors for a dependency.
     *
     * Use this for token-injected configuration objects or classes where you don't need
     * runtime modification. The mock cannot be retrieved or modified after compilation,
     * making it ideal for static configuration values.
     *
     * @param finalImplementation The fixed value or partial implementation
     * @returns TestBedBuilder for method chaining
     *
     * @remarks
     * - Mock is NOT retrievable via `unitRef.get()`
     * - Behavior is immutable after compilation
     * - Perfect for token-injected config (e.g., `@Inject('DATABASE_CONFIG')`)
     * - Also works for token-injected classes that don't need modification
     *
     * @example
     * // Configuration object
     * const { unit } = await TestBed.solitary(DatabaseService)
     *   .mock('DATABASE_CONFIG')
     *   .final({ host: 'localhost', port: 5432 })
     *   .compile();
     *
     * @example
     * // Token-injected class with fixed behavior
     * const { unit } = await TestBed.solitary(UserService)
     *   .mock('LOGGER')
     *   .final({ log: () => {}, error: () => {} })
     *   .compile();
     *
     * @since 3.0.0
     */
    final(finalImplementation: DeepPartial<TDependency>): TestBedBuilder<TClass>;
  }
}
