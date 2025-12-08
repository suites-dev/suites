import type { DeepPartial } from '@suites/types.common';
import type { ArgsType, Stub } from '@suites/types.doubles';
import type { UnitReference } from './services/unit-reference';
import type { TestBedBuilder } from './services/builders/testbed-builder';

/**
 * Represents the testing environment for a specific class, encapsulating both the instance
 * of the class under test and references to its dependencies. This setup is crucial for
 * conducting isolated and controlled unit tests.
 *
 * @template TClass The type of the class being tested. This generic parameter ensures type safety
 * and consistency across the testing code.
 * @since 3.0.0
 * @see {@link https://suites.dev/docs/api-reference/testbed-solitary | TestBed.solitary() API Reference}
 * @see {@link https://suites.dev/docs/api-reference/testbed-sociable | TestBed.sociable() API Reference}
 *
 * @example
 * ```ts
 * const { unit, unitRef } = await TestBed.solitary(UserService).compile();
 *
 * // Access the class under test
 * const result = await unit.createUser({ name: 'John' });
 *
 * // Configure mock behavior
 * const database = unitRef.get(Database);
 * database.save.mockResolvedValue({ id: 1 });
 * ```
 */
export interface UnitTestBed<TClass> {
  /**
   * The instance of the class being tested. This property provides direct access to the class,
   * allowing tests to interact with it as needed.
   *
   * @since 3.0.0
   * @see {@link https://suites.dev/docs/api-reference/testbed-solitary | TestBed.solitary() API Reference}
   */
  unit: TClass;

  /**
   * A reference to the mocked dependencies of the class. This object allows tests to manipulate,
   * access, and verify the interactions with the class's dependencies, crucial for thorough testing.
   *
   * @since 3.0.0
   * @see {@link https://suites.dev/docs/api-reference/unit-reference | UnitReference API Reference}
   */
  unitRef: UnitReference;
}

/**
 * Provides methods to define overrides for mocking dependencies within the testing environment.
 * This interface allows setting up specific behaviors or responses from the mocked dependencies,
 * facilitating precise and controlled testing scenarios.
 *
 * @template TDependency The type of the dependency being mocked. This generic ensures that
 * the mocks are appropriately typed, enhancing the development experience with type safety.
 * @template TClass The type of the class under test. This provides context to the TestBedBuilder,
 * linking the mock setups directly with the class being tested.
 * @since 3.0.0
 * @see {@link https://suites.dev/docs/api-reference/mock-configuration | Mock Configuration}
 */
export interface MockOverride<TDependency, TClass> {
  /**
   * Configures mocks with stubs that can be retrieved and modified later via `unitRef.get()`.
   *
   * Use this when you need to change mock behavior after TestBed compilation.
   *
   * @since 3.0.0
   * @param mockImplementation - A function that receives a stub function and returns a partial
   * implementation of the dependency.
   * @returns A TestBedBuilder instance for method chaining.
   * @see {@link https://suites.dev/docs/api-reference/mock-configuration | Mock Configuration}
   */
  impl(
    mockImplementation: (stubFn: Stub<any, ArgsType<TDependency>>) => DeepPartial<TDependency>
  ): TestBedBuilder<TClass>;

  /**
   * Sets immutable final values for a mocked dependency. The mock cannot be retrieved
   * or modified after compilation.
   *
   * Use this for token-injected configuration objects or when you don't need runtime modification.
   *
   * @since 3.0.0
   * @param finalImplementation - The final implementation for the dependency.
   * @returns A TestBedBuilder instance for method chaining.
   * @see {@link https://suites.dev/docs/api-reference/mock-configuration | Mock Configuration}
   */
  final(finalImplementation: DeepPartial<TDependency>): TestBedBuilder<TClass>;
}
