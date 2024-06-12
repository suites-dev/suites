import type { IdentifierMetadata } from '@suites/types.di';
import type { DeepPartial, Type, ConstantValue } from '@suites/types.common';
import type { UnitReference } from './dist';

/**
 * A factory interface for creating UnitTestBed instances for testing classes.
 *
 * @see https://suites.dev/docs/api-reference
 * @since 3.0.0
 * @example
 * import { TestBed } from '@suites/unit';
 * import { MyService } from './my-service';
 *
 * const { unit, unitRef } = await TestBed.solitary(MyService).compile();
 */
export interface TestBed {
  /**
   * Creates a new TestBedBuilder instance for the given target class. This builder helps in configuring
   * and compiling the test environment for a class that should be tested in isolation (solitary).
   * It sets up the necessary dependencies and mocks, ensuring that the class under test is the primary
   * focus without interference from other components.
   *
   * @see https://suites.dev/docs/developer-guide/unit-tests
   * @since 3.0.0
   * @template TClass - The class to be tested.
   * @param {Type<TClass>} targetClass - The class to be tested.
   * @returns {TestBedBuilder<TClass>} - The TestBedBuilder instance configured for solitary testing.
   * @example
   * import { TestBed } from '@suites/unit';
   * import { MyService } from './my-service';
   *
   * const { unit, unitRef } = await TestBed.solitary(MyService).compile();
   * // MyService is now tested in isolation with all its dependencies mocked.
   */
  solitary<TClass>(targetClass: Type<TClass>): TestBedBuilder<TClass>;
}

/**
 * Represents the outcome when a `TestBedBuilder` is compiled.
 *
 * @template TClass The class type being tested.
 * @see https://suites.dev/docs/api-reference
 */
export interface UnitTestBed<TClass> {
  /**
   * The instance of the unit under test.
   *
   * @template TClass The class being tested.
   * @property TClass unit
   */
  unit: TClass;

  /**
   * A reference to the dependencies associated with the class under test.
   *
   * @property unitRef {UnitReference}
   */
  unitRef: UnitReference;
}

/**
 * Interface to define overrides for mocking dependencies in a test environment.
 *
 * @template TDependency The type of the dependency to be mocked.
 * @template TClass The type of the class under test.
 * @see https://suites.dev/docs/api-reference
 */
export interface MockOverride<TDependency, TClass> {
  /**
   * Specifies a constant value to be used for the mocked dependency.
   *
   * @since 3.0.0
   * @param value - The constant value for the mocked dependency.
   * @template TDependency The type of the dependency being mocked.
   * @returns `TestBedBuilder` instance for chaining further configuration.
   */
  using(value: TDependency & ConstantValue): TestBedBuilder<TClass>;

  /**
   * Specifies the mock implementation to be used for the mocked dependency.
   *
   * @since 3.0.0
   * @param mockImplementation - The mock implementation for the mocked dependency.
   * @template TDependency The type of the dependency being mocked.
   * @returns `TestBedBuilder` instance for chaining further configuration.
   */
  using(mockImplementation: DeepPartial<TDependency>): TestBedBuilder<TClass>;
}

/**
 * Represents a builder for creating a TestBed instance for testing classes.
 *
 * @template TClass The class type being tested.
 * @see https://suites.dev/docs/api-reference
 * @since 3.0.0
 */
export interface TestBedBuilder<TClass> {
  /**
   * Declares a dependency to be mocked using its type.
   *
   * @since 3.0.0
   * @see https://suites.dev/docs/api-reference
   * @param type The type of the dependency.
   * @template TDependency The type of the dependency being mocked.
   * @returns MockOverride instance for further configuration.
   */
  mock<TDependency>(type: Type<TDependency>): MockOverride<TDependency, TClass>;

  /**
   * Declares a dependency to be mocked using its type along with a corresponding metadata object.
   *
   * @since 3.0.0
   * @see https://suites.dev/docs/api-reference
   * @param type The type of the dependency.
   * @param identifierMetadata the identifier metadata.
   * @template TDependency The type of the dependency being mocked.
   * @returns MockOverride instance for further configuration.
   */
  mock<TDependency>(
    type: Type<TDependency>,
    identifierMetadata: IdentifierMetadata
  ): MockOverride<TDependency, TClass>;

  /**
   * Declares a dependency to be mocked using a string-based token.
   *
   * @since 3.0.0
   * @see https://suites.dev/docs/api-reference
   * @param token The token string representing the dependency to be mocked.
   * @template TDependency The type of the dependency being mocked.
   * @returns MockOverride instance for further configuration.
   */
  mock<TDependency>(token: string): MockOverride<TDependency, TClass>;

  /**
   * Declares a dependency to be mocked using a string-based token along with a
   * corresponding metadata object.
   *
   * @since 3.0.0
   * @see https://suites.dev/docs/api-reference
   * @param token The token string representing the dependency to be mocked.
   * @param identifierMetadata the identifier metadata.
   * @template TDependency The type of the dependency being mocked.
   * @returns MockOverride instance for further configuration.
   */
  mock<TDependency>(
    token: string,
    identifierMetadata: IdentifierMetadata
  ): MockOverride<TDependency, TClass>;

  /**
   * Declares a dependency to be mocked using a symbol-based token.
   *
   * @since 3.0.0
   * @see https://suites.dev/docs/api-reference
   * @param token - The token symbol representing the dependency to be mocked.
   * @template TDependency The type of the dependency being mocked.
   * @returns MockOverride instance for further configuration.
   */
  mock<TDependency>(token: symbol): MockOverride<TDependency, TClass>;

  /**
   * Declares a dependency to be mocked using a symbol-based token along with a
   * corresponding metadata object.
   *
   * @since 3.0.0
   * @see https://suites.dev/docs/api-reference
   * @param token - The token symbol representing the dependency to be mocked.
   * @param identifierMetadata the identifier metadata if exists.
   * @template TDependency The type of the dependency being mocked.
   * @returns MockOverride instance for further configuration.
   */
  mock<TDependency>(
    token: symbol,
    identifierMetadata: IdentifierMetadata
  ): MockOverride<TDependency, TClass>;

  /**
   * Declares a dependency to be mocked using a symbol-based token along with a
   * corresponding metadata object.
   *
   * @since 3.0.0
   * @see https://suites.dev/docs/api-reference
   * @param identifier The identifier representing the dependency. It can be of type
   * `Type<TDependency>`, `string`, or `symbol`.
   * @param identifierMetadata the identifier metadata if exists.
   * @template TDependency The type of the dependency being mocked.
   * @returns MockOverride instance for further configuration.
   */
  mock<TDependency>(
    identifier: Type<TDependency> | string | symbol,
    identifierMetadata?: IdentifierMetadata
  ): MockOverride<TDependency, TClass>;

  /**
   * Compiles the UnitTestBed instance.
   *
   * @since 3.0.0
   * @returns {Promise<UnitTestBed<TClass>>} A Promise that resolves to the compiled UnitTestBed instance.
   * @template TClass The class type being tested.
   * @see https://suites.dev/docs/api-reference
   */
  compile(): Promise<UnitTestBed<TClass>>;
}
