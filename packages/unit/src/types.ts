import { IdentifierMetadata } from '@suites/types.di';
import { DeepPartial, Type, ConstantValue } from '@suites/types.common';
import { StubbedInstance } from '@suites/types.doubles';
import { BaseTestBedBuilder, UnitReference as UnitReferenceCore } from '@suites/core.unit';

/**
 * Provides a reference to mock objects that have been mocked for testing
 * purposes within the test environment.
 *
 * @see https://suites.dev/api-reference/api/unitreference-api
 */
export interface UnitReference extends UnitReferenceCore {
  /**
   * Retrieves a reference to the mocked object of a dependency corresponding to its type identifier.
   *
   * @since 2.0.0
   * @template TDependency The type of the dependency being retrieved.
   * @param type The type representing the dependency.
   * @returns The mocked object corresponding to the provided type identifier.
   */
  get<TDependency>(type: Type<TDependency>): StubbedInstance<TDependency>;

  /**
   * Retrieves a reference to the mocked object of a dependency corresponding to its type identifier
   * and metadata object.
   *
   * @since 2.1.0
   * @template TDependency The type of the dependency being retrieved.
   * @param type The type representing the dependency.
   * @param identifierMetadata A metadata object that corresponds to the type identifier.
   * @returns StubbedInstance<TDependency> The mocked object corresponding to the provided
   * symbol-based token.
   */
  get<TDependency>(
    type: Type<TDependency>,
    identifierMetadata: IdentifierMetadata
  ): StubbedInstance<TDependency>;

  /**
   * Retrieves a reference to the mocked object of a dependency corresponding to a string-based token.
   *
   * @since 2.0.0
   * @template TDependency The type of the dependency being retrieved.
   * @param token The string-based token representing the dependency.
   * @returns The mocked object corresponding to the provided string-based token.
   */
  get<TDependency>(token: string): StubbedInstance<TDependency>;

  /**
   * Retrieves a reference to the mocked object of a dependency corresponding to a string-based
   * token and an identifier metadata object.
   *
   * @since 2.1.0
   * @template TDependency The type of the dependency being retrieved.
   * @param token The symbol-based token representing the dependency.
   * @param identifierMetadata An accompanying metadata object for the token identifier.
   * @returns StubbedInstance<TDependency> The mocked object corresponding to the provided
   * symbol-based token.
   */
  get<TDependency>(
    token: string,
    identifierMetadata: IdentifierMetadata
  ): StubbedInstance<TDependency>;

  /**
   * Retrieves a reference to the mocked object of a dependency corresponding to a symbol-based token.
   *
   * @since 2.0.0
   * @template TDependency The type of the dependency being retrieved.
   * @param token The symbol-based token representing the dependency.
   * @returns The mocked object corresponding to the provided symbol-based token.
   */
  get<TDependency>(token: symbol): StubbedInstance<TDependency>;

  /**
   * Retrieves a reference to the mocked object of a dependency corresponding to a symbol-based
   * token and an identifier metadata object.
   *
   * @since 2.1.0
   * @template TDependency The type of the dependency being retrieved.
   * @param token The symbol-based token representing the dependency.
   * @param identifierMetadata An accompanying metadata object for the token identifier.
   * @returns StubbedInstance<TDependency> The mocked object corresponding to the provided symbol-based token.
   */
  get<TDependency>(
    token: symbol,
    identifierMetadata: IdentifierMetadata
  ): StubbedInstance<TDependency>;

  /**
   * Retrieves a constant value corresponding to a string-based token.
   *
   * @since 2.0.0
   * @template TValue The type of the constant value being retrieved.
   * @param token The string-based token representing the constant value.
   * @returns The constant value corresponding to the provided string-based token.
   */
  get<TValue extends ConstantValue>(token: string): TValue;

  /**
   * Retrieves a constant value corresponding to a symbol-based token.
   *
   * @since 2.0.0
   * @template TValue The type of the constant value being retrieved.
   * @param token The symbol-based token representing the constant value.
   * @returns The constant value corresponding to the provided symbol-based token.
   */
  get<TValue extends ConstantValue>(token: symbol): TValue;

  /**
   * Retrieves a mocked object or a constant value of a dependency using its type, string, or symbol token.
   *
   * This method provides flexibility in retrieving dependencies by allowing various identifier types.
   * Depending on the identifier and the setup, it can return either a mocked object or a constant value.
   *
   * @since 2.1.0
   * @template TDependency The type of the dependency being retrieved.
   * @template TValue The type of the constant value that might be returned.
   * @param identifier The token representing the dependency. It can be of type `Type<TDependency>`, `string`, or `symbol`.
   * @param identifierMetadata A corresponding metadata object for the token identifier.
   * @returns StubbedInstance<TDependency> The mocked instance corresponding to the provided identifier and metadata if exists.
   */
  get<TDependency>(
    identifier: Type<TDependency> | string | symbol,
    identifierMetadata?: IdentifierMetadata
  ): StubbedInstance<TDependency>;

  /**
   * Retrieves a mocked object or a constant value of a dependency using its type, string, or symbol token.
   *
   * This method provides flexibility in retrieving dependencies by allowing various identifier types.
   * Depending on the identifier and the setup, it can return either a mocked object or a constant value.
   *
   * @since 2.0.0
   * @template TDependency The type of the dependency being retrieved.
   * @template TValue The type of the constant value that might be returned.
   * @param identifier The token representing the dependency. It can be of type `Type<TDependency>`, `string`, or `symbol`.
   * @returns The mocked instance or constant value corresponding to the provided identifier.
   */
  get<TDependency, TValue extends ConstantValue>(
    identifier: Type<TDependency> | string | symbol
  ): StubbedInstance<TDependency> | TValue;
}

export interface TestBed {
  /**
   * @description Creates new TestBedBuilder instance for the given target class.
   *
   * @template TClass - The class to be tested.
   * @param {Type<TClass>} targetClass - The class to be tested.
   * @returns {BaseTestBedBuilder<TClass>} - The TestBedBuilder instance.
   */
  solitary<TClass>(targetClass: Type<TClass>): BaseTestBedBuilder<TClass>;

  sociable<TClass>(targetClass: Type<TClass>): BaseTestBedBuilder<TClass>;

  /**
   * @deprecated Use TestBed.solitary() instead.
   * @param targetClass
   */
  create<TClass>(targetClass: Type<TClass>): BaseTestBedBuilder<TClass>;
}

/**
 * Represents the outcome when a `TestBedBuilder` is compiled.
 *
 * @template TClass The class type being tested.
 * @see https://suites.dev/api-reference/api/unittestbed-api
 */
export interface UnitTestBed<TClass> {
  /**
   * The instance of the class under test.
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
 * @see https://suites.dev/api-reference/api/mockoverride-api
 */
export interface MockOverride<TDependency, TClass> {
  /**
   * Specifies a constant value to be used for the mocked dependency.
   *
   * @since 2.0.0
   * @param value - The constant value for the mocked dependency.
   * @returns `TestBedBuilder` instance for chaining further configuration.
   */
  using(value: TDependency & ConstantValue): BaseTestBedBuilder<TClass>;

  /**
   * Specifies the mock implementation to be used for the mocked dependency.
   *
   * @since 2.0.0
   * @param mockImplementation - The mock implementation for the mocked dependency.
   * @returns `TestBedBuilder` instance for chaining further configuration.
   */
  using(mockImplementation: DeepPartial<TDependency>): BaseTestBedBuilder<TClass>;
}

/**
 * Provides methods to configure and finalize the `TestBed`.
 *
 * @template TClass The class type being tested.
 * @see https://suites.dev/api-reference/api/testbedbuilder-api
 */
export interface TestBedBuilder<TClass> extends BaseTestBedBuilder<TClass> {
  /**
   * Declares a dependency to be mocked using its type.
   *
   * @since 1.1.0
   * @param type The type of the dependency.
   * @template TDependency The type of the dependency being mocked.
   * @returns MockOverride instance for further configuration.
   */
  mock<TDependency>(type: Type<TDependency>): MockOverride<TDependency, TClass>;

  /**
   * Declares a dependency to be mocked using its type along with a corresponding metadata object.
   *
   * @since 2.1.0
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
   * @since 1.1.0
   * @param token The token string representing the dependency to be mocked.
   * @template TDependency The type of the dependency being mocked.
   * @returns MockOverride instance for further configuration.
   */
  mock<TDependency>(token: string): MockOverride<TDependency, TClass>;

  /**
   * Declares a dependency to be mocked using a string-based token along with a corresponding
   * metadata object.
   *
   * @since 2.1.0
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
   * @since 2.0.0
   * @param token - The token symbol representing the dependency to be mocked.
   * @template TDependency The type of the dependency being mocked.
   * @returns MockOverride instance for further configuration.
   */
  mock<TDependency>(token: symbol): MockOverride<TDependency, TClass>;

  /**
   * Declares a dependency to be mocked using a symbol-based token along with a corresponding
   * metadata object.
   *
   * @since 2.1.0
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
   * Declares a dependency to be mocked using a symbol-based token along with a corresponding
   * metadata object.
   *
   * @since 2.1.0
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
   * Finalizes the mocking setup and creates a new UnitTestBed.
   *
   * @since 1.1.0
   * @returns UnitTestBed instance representing the compiled unit.
   */
  compile(): Promise<UnitTestBed<TClass>>;
}
