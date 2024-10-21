import type { IdentifierMetadata } from '@suites/types.di';
import type { DeepPartial, Type } from '@suites/types.common';
import type { ArgsType, Stub, StubbedInstance } from '@suites/types.doubles';
import type {
  SociableTestBedBuilder as SociableTestBedBuilderCore,
  TestBedBuilder as TestBedBuilderCore,
  UnitReference as UnitReferenceCore,
  MockOverride as MockOverrideCore,
} from '@suites/core.unit';

export interface SociableTestBedBuilder<TClass> extends SociableTestBedBuilderCore<TClass> {
  /**
   * Exposes a dependency to be included in the test environment in its real or partially mocked state.
   * This method is used to selectively expose dependencies that should not be fully mocked.
   * It allows for sociable testing, where the class under test interacts with real implementations
   * or partial mocks of certain dependencies.
   *
   * @since 3.0.0
   * @template TClass The type of the class under test.
   * @param dependency The dependency to be exposed in its real or partially mocked state.
   * @returns A TestBedBuilder instance for further configuration.
   * @example
   * import { TestBed } from '@suites/unit';
   * import { MyService, AnotherService } from './my-service';
   *
   * const { unit, unitRef } = await TestBed.sociable(MyService).expose(AnotherService).compile();
   * // MyService is now tested with AnotherService exposed and not fully mocked.
   * @see https://suites.dev/docs/developer-guide/unit-tests
   * @param dependency
   */
  expose(dependency: Type): SociableTestBedBuilder<TClass>;
}

export interface SolitaryTestBedBuilder<TClass> extends TestBedBuilder<TClass> {}

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
   * @since 3.0.0
   * @template TDependency The type of the dependency being retrieved.
   * @param type The type representing the dependency.
   * @throws {IdentifierNotFoundError} - If the dependency is not found.
   * @returns The mocked object corresponding to the provided type identifier.
   */
  get<TDependency>(type: Type<TDependency>): StubbedInstance<TDependency>;

  /**
   * Retrieves a reference to the mocked object of a dependency corresponding to its type identifier
   * and metadata object.
   *
   * @since 3.0.0
   * @template TDependency The type of the dependency being retrieved.
   * @param type The type representing the dependency.
   * @param identifierMetadata A metadata object that corresponds to the type identifier.
   * @throws {IdentifierNotFoundError} - If the dependency is not found.
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
   * @since 3.0.0
   * @template TDependency The type of the dependency being retrieved.
   * @param token The string-based token representing the dependency.
   * @throws {IdentifierNotFoundError} - If the dependency is not found.
   * @returns The mocked object corresponding to the provided string-based token.
   */
  get<TDependency>(token: string): StubbedInstance<TDependency>;

  /**
   * Retrieves a reference to the mocked object of a dependency corresponding to a string-based
   * token and an identifier metadata object.
   *
   * @since 3.0.0
   * @template TDependency The type of the dependency being retrieved.
   * @param token The symbol-based token representing the dependency.
   * @param identifierMetadata An accompanying metadata object for the token identifier.
   * @throws {IdentifierNotFoundError} - If the dependency is not found.
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
   * @since 3.0.0
   * @template TDependency The type of the dependency being retrieved.
   * @param token The symbol-based token representing the dependency.
   * @throws {IdentifierNotFoundError} - If the dependency is not found.
   * @returns The mocked object corresponding to the provided symbol-based token.
   */
  get<TDependency>(token: symbol): StubbedInstance<TDependency>;

  /**
   * Retrieves a reference to the mocked object of a dependency corresponding to a symbol-based
   * token and an identifier metadata object.
   *
   * @since 3.0.0
   * @template TDependency The type of the dependency being retrieved.
   * @param token The symbol-based token representing the dependency.
   * @param identifierMetadata An accompanying metadata object for the token identifier.
   * @throws {IdentifierNotFoundError} - If the dependency is not found.
   * @returns StubbedInstance<TDependency> The mocked object corresponding to the provided symbol-based token.
   */
  get<TDependency>(
    token: symbol,
    identifierMetadata: IdentifierMetadata
  ): StubbedInstance<TDependency>;

  /**
   * Retrieves a mocked object or a constant value of a dependency impl its type, string, or symbol token.
   *
   * This method provides flexibility in retrieving dependencies by allowing various identifier types.
   * Depending on the identifier and the setup, it can return either a mocked object or a constant value.
   *
   * @since 3.0.0
   * @template TDependency The type of the dependency being retrieved.
   * @template TValue The type of the constant value that might be returned.
   * @param identifier The token representing the dependency. It can be of type `Type<TDependency>`, `string`, or `symbol`.
   * @param identifierMetadata A corresponding metadata object for the token identifier.
   * @throws {IdentifierNotFoundError} - If the dependency is not found.
   * @returns StubbedInstance<TDependency> The mocked instance corresponding to the provided identifier and metadata if exists.
   */
  get<TDependency>(
    identifier: Type<TDependency> | string | symbol,
    identifierMetadata?: IdentifierMetadata
  ): StubbedInstance<TDependency>;

  /**
   * Retrieves a mocked object or a constant value of a dependency impl its type, string, or symbol token.
   *
   * This method provides flexibility in retrieving dependencies by allowing various identifier types.
   * Depending on the identifier and the setup, it can return either a mocked object or a constant value.
   *
   * @since 3.0.0
   * @template TDependency The type of the dependency being retrieved.
   * @template TValue The type of the constant value that might be returned.
   * @param identifier The token representing the dependency. It can be of type `Type<TDependency>`, `string`, or `symbol`.
   * @throws {IdentifierNotFoundError} - If the dependency is not found.
   * @returns The mocked instance or constant value corresponding to the provided identifier.
   */
  get<TDependency>(identifier: Type<TDependency> | string | symbol): StubbedInstance<TDependency>;
}

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
   * @returns {SolitaryTestBedBuilder<TClass>} - The TestBedBuilder instance configured for solitary testing.
   * @example
   * import { TestBed } from '@suites/unit';
   * import { MyService } from './my-service';
   *
   * // MyService is now tested in isolation with all its dependencies mocked.
   * const { unit, unitRef } = await TestBed.solitary(MyService).compile();
   */
  solitary<TClass>(targetClass: Type<TClass>): SolitaryTestBedBuilder<TClass>;

  /**
   * Creates a TestBedBuilder instance for the given target class for sociable testing.
   * Sociable testing allows for the inclusion of real implementations or partial mocks of certain dependencies.
   * This method returns a subset of the SociableTestBedBuilder's methods, focimpl on exposing
   * specific dependencies that should be included in their real or partially mocked state.
   *
   * @see https://suites.dev/docs/developer-guide/unit-tests
   * @template TClass - The type of the target class.
   * @param {Type<TClass>} targetClass - The target class to be tested.
   * @returns {Pick<SociableTestBedBuilder<TClass>, 'expose'>} - A subset of the SociableTestBedBuilder's methods
   * containing only the 'expose' method.
   * @since 3.0.0
   * @example
   * import { TestBed } from '@suites/unit';
   * import { MyService } from './my-service';
   * import { AnotherService } from './another-service';
   *
   * const { unit, unitRef } = await TestBed.sociable(MyService).expose(AnotherService).compile();
   * // MyService is now tested with AnotherService exposed and not fully mocked.
   */
  sociable<TClass>(targetClass: Type<TClass>): SociableTestBedBuilder<TClass>;
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
export interface MockOverride<TDependency, TClass> extends MockOverrideCore<TDependency, TClass> {
  /**
   * Specifies the mock implementation to be used for the mocked dependency.
   *
   * @since 3.0.0
   * @param mockImplementation - The mock implementation for the mocked dependency.
   * @returns `TestBedBuilder` instance for chaining further configuration.
   */
  impl(
    mockImplementation: (stubFn: Stub<any, ArgsType<TDependency>>) => DeepPartial<TDependency>
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

/**
 * Provides methods to configure and finalize the `TestBed`.
 *
 * @template TClass The class type being tested.
 * @see https://suites.dev/api-reference/api/testbedbuilder-api
 */
export interface TestBedBuilder<TClass> extends TestBedBuilderCore<TClass> {
  /**
   * Declares a dependency to be mocked impl its type.
   *
   * @since 3.0.0
   * @param type The type of the dependency.
   * @template TDependency The type of the dependency being mocked.
   * @returns MockOverride instance for further configuration.
   */
  mock<TDependency>(type: Type<TDependency>): MockOverride<TDependency, TClass>;

  /**
   * Declares a dependency to be mocked impl its type along with a corresponding metadata object.
   *
   * @since 3.0.0
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
   * Declares a dependency to be mocked impl a string-based token.
   *
   * @since 3.0.0
   * @param token The token string representing the dependency to be mocked.
   * @template TDependency The type of the dependency being mocked.
   * @returns MockOverride instance for further configuration.
   */
  mock<TDependency>(token: string): MockOverride<TDependency, TClass>;

  /**
   * Declares a dependency to be mocked impl a string-based token along with a corresponding
   * metadata object.
   *
   * @since 3.0.0
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
   * Declares a dependency to be mocked impl a symbol-based token.
   *
   * @since 3.0.0
   * @param token - The token symbol representing the dependency to be mocked.
   * @template TDependency The type of the dependency being mocked.
   * @returns MockOverride instance for further configuration.
   */
  mock<TDependency>(token: symbol): MockOverride<TDependency, TClass>;

  /**
   * Declares a dependency to be mocked impl a symbol-based token along with a corresponding
   * metadata object.
   *
   * @since 3.0.0
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
   * Declares a dependency to be mocked impl a symbol-based token along with a corresponding
   * metadata object.
   *
   * @since 3.0.0
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
   * @since 3.0.0
   * @returns UnitTestBed instance representing the compiled unit.
   */
  compile(): Promise<UnitTestBed<TClass>>;
}
