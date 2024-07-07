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
 */
export interface UnitTestBed<TClass> {
  /**
   * The instance of the class being tested. This property provides direct access to the class,
   * allowing tests to interact with it as needed.
   * @since 3.0.0
   * @see https://suites.dev/docs/api-reference
   * @template TClass The type of the class under test.
   * @property {TClass} unit The instance of the class under test.
   */
  unit: TClass;

  /**
   * A reference to the mocked dependencies of the class. This object allows tests to manipulate,
   * access, and verify the interactions with the class's dependencies, crucial for thorough testing.
   * @since 3.0.0
   * @see https://suites.dev/docs/api-reference
   * @property {UnitReference} unitRef The reference to the mocked dependencies of the class.
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
 */
export interface MockOverride<TDependency, TClass> {
  /**
   * Defines a custom implementation for a mocked dependency. This method is used to set up
   * how the mock should behave when interacted with during tests.
   *
   * @since 3.0.0
   * @param mockImplementation A function that receives a stub function and returns a partial
   * implementation of the dependency. This setup allows testers to specify detailed behavior,
   * including how methods should respond when invoked.
   * @returns {TestBedBuilder} A TestBedBuilder instance, facilitating a fluent interface that allows further
   * configuration of the testing environment.
   */
  impl(
    mockImplementation: (stubFn: Stub<any, ArgsType<TDependency>>) => DeepPartial<TDependency>
  ): TestBedBuilder<TClass>;

  /**
   * Sets a final, concrete implementation for a mocked dependency, effectively replacing any
   * previous setups for this mock. This method can be used to transition from a mock to a real
   * implementation in a controlled manner.
   *
   * @since 3.0.0
   * @param finalImplementation The final implementation for the dependency, which may partially
   * or fully replace the mock. This allows for integration testing scenarios within a unit test framework.
   * @returns {TestBedBuilder} A TestBedBuilder instance, allowing for further configuration or finalization of the
   * test setup.
   */
  final(finalImplementation: DeepPartial<TDependency>): TestBedBuilder<TClass>;
}
