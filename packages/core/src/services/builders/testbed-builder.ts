import type { IdentifierToFinal, IdentifierToMockImplWithCb } from '../dependency-container.js';
import type { DeepPartial, FinalValue, Type } from '@suites/types.common';
import type { IdentifierMetadata, InjectableIdentifier } from '@suites/types.di';
import { normalizeIdentifier } from '../../normalize-identifier.static.js';
import type { MockOverride, UnitTestBed } from '../../types.js';
import type { ArgsType, Stub } from '@suites/types.doubles';

/**
 * Abstract base class for building test environments in both solitary and sociable modes.
 *
 * This class implements the core builder pattern for configuring mock dependencies before
 * compilation. It maintains two collections:
 * - Dependencies to be mocked with stub functions (`.impl()`)
 * - Dependencies to be replaced with concrete values (`.final()`)
 *
 * Subclasses (SolitaryTestBedBuilder, SociableTestBedBuilder) extend this to provide
 * mode-specific compilation logic.
 *
 * @internal This is an internal implementation class extended by builder implementations
 * @since 3.0.0
 * @template TClass The type of the class being tested
 */
export abstract class TestBedBuilder<TClass> implements TestBedBuilder<TClass> {
  /**
   * Tracks dependencies configured with `.mock().impl()` for stub-based mocking.
   * Each entry contains the normalized identifier and the mock implementation callback.
   */
  protected readonly identifiersToBeMocked: IdentifierToMockImplWithCb[] = [];

  /**
   * Tracks dependencies configured with `.mock().final()` for concrete value replacement.
   * Each entry contains the normalized identifier and the final implementation value.
   */
  protected readonly identifiersToBeFinalized: IdentifierToFinal[] = [];

  public mock<TDependency>(type: Type<TDependency>): MockOverride<TDependency, TClass>;
  public mock<TDependency>(
    type: Type<TDependency>,
    identifierMetadata: IdentifierMetadata
  ): MockOverride<TDependency, TClass>;
  public mock<TDependency>(token: string): MockOverride<TDependency, TClass>;
  public mock<TDependency>(
    token: string,
    identifierMetadata: IdentifierMetadata
  ): MockOverride<TDependency, TClass>;
  public mock<TDependency>(token: symbol): MockOverride<TDependency, TClass>;
  public mock<TDependency>(
    token: symbol,
    identifierMetadata: IdentifierMetadata
  ): MockOverride<TDependency, TClass>;
  public mock<TDependency>(
    identifier: Type<TDependency> | string | symbol,
    identifierMetadata?: IdentifierMetadata
  ): MockOverride<TDependency, TClass>;
  /**
   * Declares a dependency to be mocked and returns a MockOverride for configuration.
   *
   * This method implements the builder pattern by returning an object with two methods:
   * - `.impl()`: Configures the mock with stub functions (for method spies/mocks)
   * - `.final()`: Replaces the dependency with a concrete value (for simple fakes)
   *
   * The dependency identifier is normalized and stored in the appropriate collection
   * for later processing during compilation.
   *
   * @since 3.0.0
   * @template TDependency The type of the dependency being mocked
   * @param identifier The dependency identifier (class type, string token, or symbol token)
   * @param metadata Optional metadata for token-based dependencies
   * @returns MockOverride object with impl() and final() configuration methods
   *
   * @example
   * // Mock with stub functions
   * testBedBuilder
   *   .mock(Logger)
   *   .impl((stub) => ({ log: stub().mockReturnValue(undefined) }));
   *
   * @example
   * // Mock with concrete value
   * testBedBuilder
   *   .mock('API_URL')
   *   .final('https://test.api.com');
   */
  public mock<TDependency>(
    identifier: InjectableIdentifier,
    metadata?: IdentifierMetadata
  ): MockOverride<TDependency, TClass> {
    return {
      impl: (
        mockImplementation: (
          stubFn: () => Stub<TDependency, ArgsType<TDependency>>
        ) => DeepPartial<TDependency>
      ): TestBedBuilder<TClass> => {
        // Store the mock implementation for later compilation
        this.identifiersToBeMocked.push([
          normalizeIdentifier(identifier, metadata as never),
          mockImplementation,
        ]);

        return this;
      },
      final: (finalImplementation: FinalValue<TDependency>): TestBedBuilder<TClass> => {
        // Store the final implementation for later compilation
        this.identifiersToBeFinalized.push([
          normalizeIdentifier(identifier, metadata as never),
          finalImplementation,
        ]);

        return this;
      },
    };
  }

  /**
   * Compiles the UnitTestBed instance.
   *
   * This method sets up and initializes the test environment for the specified class,
   * resolving all dependencies and applying the defined mocks. The result is a
   * `UnitTestBed` instance that provides access to the class under test and its
   * mocked dependencies, ready for testing.
   *
   * @since 3.0.0
   * @returns {Promise<UnitTestBed<TClass>>} A Promise that resolves to the compiled `UnitTestBed` instance.
   * @template TClass The type of the class being tested.
   * @example
   * const unitTestBed = await testBedBuilder.compile();
   * const { unit, unitRef } = unitTestBed;
   * // unit is the instance of the class under test
   * // unitRef provides access to the mocked dependencies
   */
  public abstract compile(): Promise<UnitTestBed<TClass>>;
}

/**
 * Interface representing a builder for configuring and creating test beds for unit testing classes.
 *
 * @template TClass The type of the class being tested.
 * @since 3.0.0
 */
export interface TestBedBuilder<TClass> {
  /**
   * Declares a dependency to be mocked using its type.
   *
   * @since 3.0.0
   * @template TDependency The type of the dependency being mocked.
   * @param {Type<TDependency>} type The type representing the dependency to be mocked.
   * @template TClass The type of the class being tested.
   * @returns {MockOverride<TDependency, TClass>} An instance of MockOverride for further configuration.
   * @example
   * const mockOverride = testBedBuilder.mock<MyService>(MyService);
   */
  mock<TDependency>(type: Type<TDependency>): MockOverride<TDependency, TClass>;

  /**
   * Declares a dependency to be mocked using its type along with a corresponding metadata object.
   *
   * @since 3.0.0
   * @template TDependency The type of the dependency being mocked.
   * @template TClass The type of the class being tested.
   * @param {Type<TDependency>} type The type representing the dependency to be mocked.
   * @param {IdentifierMetadata} identifierMetadata Metadata object that corresponds to the type identifier.
   * @returns {MockOverride<TDependency, TClass>} An instance of MockOverride for further configuration.
   * @example
   * const mockOverride = testBedBuilder.mock<MyService>(MyService, metadata);
   */
  mock<TDependency>(
    type: Type<TDependency>,
    identifierMetadata: IdentifierMetadata
  ): MockOverride<TDependency, TClass>;

  /**
   * Declares a dependency to be mocked using a string-based token.
   *
   * @since 3.0.0
   * @template TDependency The type of the dependency being mocked.
   * @template TClass The type of the class being tested.
   * @param {string} token The string-based token representing the dependency to be mocked.
   * @returns {MockOverride<TDependency, TClass>} An instance of MockOverride for further configuration.
   * @example
   * const mockOverride = testBedBuilder.mock<MyService>('MyService');
   */
  mock<TDependency>(token: string): MockOverride<TDependency, TClass>;

  /**
   * Declares a dependency to be mocked using a string-based token along with a corresponding metadata object.
   *
   * @since 3.0.0
   * @template TDependency The type of the dependency being mocked.
   * @template TClass The type of the class being tested.
   * @param {string} token The string-based token representing the dependency to be mocked.
   * @param {IdentifierMetadata} identifierMetadata Metadata object that corresponds to the string-based token.
   * @returns {MockOverride<TDependency, TClass>} An instance of MockOverride for further configuration.
   * @example
   * const mockOverride = testBedBuilder.mock<MyService>('MyService', metadata);
   */
  mock<TDependency>(
    token: string,
    identifierMetadata: IdentifierMetadata
  ): MockOverride<TDependency, TClass>;

  /**
   * Declares a dependency to be mocked using a symbol-based token.
   *
   * @since 3.0.0
   * @template TDependency The type of the dependency being mocked.
   * @template TClass The type of the class being tested.
   * @param {symbol} token The symbol-based token representing the dependency to be mocked.
   * @returns {MockOverride<TDependency, TClass>} An instance of MockOverride for further configuration.
   * @example
   * const mockOverride = testBedBuilder.mock<MyService>(MY_SERVICE_SYMBOL);
   */
  mock<TDependency>(token: symbol): MockOverride<TDependency, TClass>;

  /**
   * Declares a dependency to be mocked using a symbol-based token along with a corresponding metadata object.
   *
   * @since 3.0.0
   * @template TDependency The type of the dependency being mocked.
   * @template TClass The type of the class being tested.
   * @param {symbol} token The symbol-based token representing the dependency to be mocked.
   * @param {IdentifierMetadata} identifierMetadata Metadata object that corresponds to the symbol-based token.
   * @returns {MockOverride<TDependency, TClass>} An instance of MockOverride for further configuration.
   * @example
   * const mockOverride = testBedBuilder.mock<MyService>(MY_SERVICE_SYMBOL, metadata);
   */
  mock<TDependency>(
    token: symbol,
    identifierMetadata: IdentifierMetadata
  ): MockOverride<TDependency, TClass>;

  /**
   * Declares a dependency to be mocked using its type, string-based token, or symbol-based token,
   * with an optional metadata object.
   *
   * @since 3.0.0
   * @template TDependency The type of the dependency being mocked.
   * @template TClass The type of the class being tested.
   * @param {Type<TDependency> | string | symbol} identifier The type or token representing the dependency to be mocked.
   * @param {IdentifierMetadata} [identifierMetadata] Optional metadata object for the identifier.
   * @returns {MockOverride<TDependency, TClass>} An instance of MockOverride for further configuration.
   * @example
   * const mockOverride = testBedBuilder.mock<MyService>(MyService);
   * // or
   * const mockOverride = testBedBuilder.mock<MyService>('MyService');
   * // or
   * const mockOverride = testBedBuilder.mock<MyService>(MY_SERVICE_SYMBOL, metadata);
   */
  mock<TDependency>(
    identifier: Type<TDependency> | string | symbol,
    identifierMetadata?: IdentifierMetadata
  ): MockOverride<TDependency, TClass>;
}

/**
 * Interface representing a builder for configuring and creating test beds for unit testing classes.
 *
 * @template TClass The type of the class being tested.
 */
export interface TestBedBuilder<TClass> {
  /**
   * Declares a dependency to be mocked using its type.
   *
   * @since 3.0.0
   * @template TDependency The type of the dependency being mocked.
   * @param {type: TDependency} type The type representing the dependency to be mocked.
   * @returns {MockOverride<TDependency, TClass>} An instance of MockOverride for further configuration.
   * @example
   * const mockOverride = testBedBuilder.mock<MyService>(MyService);
   */
  mock<TDependency>(type: new (...args: any[]) => TDependency): MockOverride<TDependency, TClass>;

  /**
   * Declares a dependency to be mocked using a string-based token.
   *
   * @since 3.0.0
   * @template TDependency The type of the dependency being mocked.
   * @param {token: string} token The string-based token representing the dependency to be mocked.
   * @returns {MockOverride<TDependency, TClass>} An instance of MockOverride for further configuration.
   * @example
   * const mockOverride = testBedBuilder.mock<MyService>('MyService');
   */
  mock<TDependency>(token: string): MockOverride<TDependency, TClass>;

  /**
   * Declares a dependency to be mocked using a symbol-based token.
   *
   * @since 3.0.0
   * @template TDependency The type of the dependency being mocked.
   * @param {token: symbol} token The symbol-based token representing the dependency to be mocked.
   * @returns {MockOverride<TDependency, TClass>} An instance of MockOverride for further configuration.
   * @example
   * const mockOverride = testBedBuilder.mock<MyService>(MY_SERVICE_SYMBOL);
   */
  mock<TDependency>(token: symbol): MockOverride<TDependency, TClass>;

  /**
   * Declares a dependency to be mocked using its type, string-based token, or symbol-based token.
   *
   * @since 3.0.0
   * @template TDependency The type of the dependency being mocked.
   * @param {identifier: TDependency | string | symbol} identifier The type or token representing the dependency to be mocked.
   * @param {IdentifierMetadata} [identifierMetadata] Optional metadata object for the identifier.
   * @returns {MockOverride<TDependency, TClass>} An instance of MockOverride for further configuration.
   * @example
   * const mockOverride = testBedBuilder.mock<MyService>(MyService);
   * // or
   * const mockOverride = testBedBuilder.mock<MyService>('MyService');
   * // or
   * const mockOverride = testBedBuilder.mock<MyService>(MY_SERVICE_SYMBOL, metadata);
   */
  mock<TDependency>(
    identifier: new (...args: any[]) => TDependency | string | symbol,
    identifierMetadata?: IdentifierMetadata
  ): MockOverride<TDependency, TClass>;
}
