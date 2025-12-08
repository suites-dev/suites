/// <reference types="@vitest/spy" />
import type { DeepPartial, Type } from '@suites/types.common';
import type { IdentifierMetadata } from '@suites/types.di';
import type { TestBedBuilder } from '@suites/core.unit';
import type { Mocked as VitestMocked, Stub as VitestStub } from '.';
import type { ArgsType } from '@suites/types.doubles';

/**
 * Vitest Adapter Type Augmentation
 *
 * This file bridges the abstract types from @suites/unit to Vitest-specific concrete implementations
 * through TypeScript module augmentation. When this adapter is installed, these augmentations
 * override the base abstract types with Vitest's testing framework capabilities.
 *
 * The augmentation boundary:
 * - Base abstractions: StubbedInstance<T>, Stub<T> (from @suites/types.doubles)
 * - Augmented types: VitestMocked<T>, vi.Mock (from this adapter)
 * - User imports from @suites/unit and transparently gets Vitest types
 */

declare module '@suites/unit' {
  /**
   * Represents a stub function typically used in testing to replace other functions or methods.
   * This type extends vi.Mock to leverage Vitest's built-in mocking capabilities.
   *
   * @since 3.0.0
   * @template T The return type of the stub function.
   * @template TArgs The arguments type of the stub function.
   * @alias vi.Mock
   * @see https://suites.dev/docs/api-reference
   */
  export type Stub<TArgs extends any[]> = VitestStub<TArgs>;

  /**
   * Vitest-specific mocked instance type where all methods are Vitest mocks.
   *
   * This augmentation overrides the base `Mocked<T>` type from `@suites/unit`
   * with Vitest's concrete mock implementation when the Vitest adapter is installed.
   *
   * @template T The type of the object being mocked
   *
   * @remarks
   * This type should be imported from `@suites/unit`, NOT from this package.
   * TypeScript automatically resolves to this Vitest-specific type when the
   * Vitest adapter is installed.
   *
   * @example
   * ```ts
   * // ✅ Correct - import from @suites/unit
   * import { Mocked } from '@suites/unit';
   *
   * // ❌ Wrong - do not import from adapter package
   * import { Mocked } from '@suites/doubles.vitest';
   * ```
   *
   * @since 3.0.0
   * @see {@link https://vitest.dev/api/vi.html#vi-mock | Vitest Mocked}
   * @see {@link https://suites.dev/docs/api-reference/types | Type Reference}
   */
  export type Mocked<T> = VitestMocked<T>;
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
   * - All retrieved mocks are fully typed with Vitest's mocking capabilities
   * - Use this to configure mock behavior and assertions after TestBed compilation
   *
   * @example
   * ```ts
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
   * ```
   *
   * @since 3.0.0
   * @see {@link https://suites.dev/docs/api-reference/unitreference | UnitReference Guide}
   */
  export interface UnitReference {
    /**
     * Retrieves a mocked dependency by string token.
     * Used for token-based injection like `@Inject('CONFIG')`.
     * @example
     * ```ts
     * unitRef.get<ConfigService>('CONFIG_SERVICE')
     * ```
     */
    get<TDependency>(token: string): VitestMocked<TDependency>;

    /**
     * Retrieves a mocked dependency by string token with metadata.
     * Used for advanced DI scenarios with additional constraints.
     */
    get<TDependency>(
      token: string,
      identifierMetadata: IdentifierMetadata
    ): VitestMocked<TDependency>;

    /**
     * Retrieves a mocked dependency by symbol token.
     * Used when symbols are used as injection tokens for uniqueness.
     * @example
     * ```ts
     * unitRef.get<Logger>(LoggerSymbol)
     * ```
     */
    get<TDependency>(token: symbol): VitestMocked<TDependency>;

    /**
     * Retrieves a mocked dependency by symbol token with metadata.
     * Used for advanced DI scenarios with symbol tokens.
     */
    get<TDependency>(
      token: symbol,
      identifierMetadata: IdentifierMetadata
    ): VitestMocked<TDependency>;

    /**
     * Retrieves a mocked dependency by its class type.
     * The most common way to get mocked dependencies.
     * @example
     * ```ts
     * const userRepo = unitRef.get(UserRepository)
     * ```
     */
    get<TDependency>(type: Type<TDependency>): VitestMocked<TDependency>;

    /**
     * Retrieves a mocked dependency by class type with metadata.
     * Used for advanced DI scenarios with tagged/named dependencies.
     */
    get<TDependency>(
      type: Type<TDependency>,
      identifierMetadata: IdentifierMetadata
    ): VitestMocked<TDependency>;

    /**
     * Flexible overload for retrieving mocked dependencies.
     * Accepts class types, string tokens, or symbol tokens.
     */
    get<TDependency>(
      identifier: Type<TDependency> | string | symbol,
      identifierMetadata?: IdentifierMetadata
    ): VitestMocked<TDependency>;
  }

  /**
   * Interface defining methods for configuring mock overrides in unit testing environments.
   * This allows detailed setup of mock behavior for dependencies of the class under test.
   *
   * @since 3.0.0
   * @template TDependency The type of the dependency to be mocked.
   * @template TClass The type of the class under test.
   * @see {@link https://suites.dev/docs/api-reference/mock-configuration | Mock Configuration}
   */
  export interface MockOverride<TDependency, TClass> {
    /**
     * Configures mocks with stubs that can be retrieved and modified later.
     *
     * Use this when you need to change mock behavior after TestBed compilation.
     * The `stubFn` parameter provides Vitest stub functions that you can configure,
     * and the resulting mock can be retrieved via `unitRef.get()` for further modifications.
     *
     * @param mockImplementation - Function that receives a stub factory and returns partial mock implementation
     * @returns A TestBedBuilder instance for method chaining
     *
     * @remarks
     * - Mocks are retrievable via `unitRef.get()` after compilation
     * - Allows runtime behavior modification during tests
     * - Best for class-based dependencies where you need flexible control
     *
     * @example
     * ```ts
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
     * ```
     *
     * @since 3.0.0
     */
    impl(
      mockImplementation: (
        stubFn: () => VitestStub<ArgsType<TDependency>>
      ) => DeepPartial<TDependency>
    ): TestBedBuilder<TClass>;

    /**
     * Sets immutable final values or behaviors for a dependency.
     *
     * Use this for token-injected configuration objects or classes where you don't need
     * runtime modification. The mock cannot be retrieved or modified after compilation,
     * making it ideal for static configuration values.
     *
     * @param finalImplementation - The fixed value or partial implementation
     * @returns A TestBedBuilder instance for method chaining
     *
     * @remarks
     * - Mock is NOT retrievable via `unitRef.get()`
     * - Behavior is immutable after compilation
     * - Perfect for token-injected config (e.g., `@Inject('DATABASE_CONFIG')`)
     * - Also works for token-injected classes that don't need modification
     *
     * @example
     * ```ts
     * // Configuration object
     * const { unit } = await TestBed.solitary(DatabaseService)
     *   .mock('DATABASE_CONFIG')
     *   .final({ host: 'localhost', port: 5432 })
     *   .compile();
     * ```
     *
     * @example
     * ```ts
     * // Token-injected class with fixed behavior
     * const { unit } = await TestBed.solitary(UserService)
     *   .mock('LOGGER')
     *   .final({ log: () => {}, error: () => {} })
     *   .compile();
     * ```
     *
     * @since 3.0.0
     */
    final(finalImplementation: DeepPartial<TDependency>): TestBedBuilder<TClass>;
  }
}
