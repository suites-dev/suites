import type { IdentifierToFinal, IdentifierToMockImplWithCb } from '../dependency-container';
import type { DeepPartial, FinalValue, Type } from '@suites/types.common';
import type { IdentifierMetadata, InjectableIdentifier } from '@suites/types.di';
import { normalizeIdentifier } from '../../normalize-identifier.static';
import type { MockOverride, UnitTestBed } from '../../types';
import type { ArgsType, Stub } from '@suites/types.doubles';

export abstract class TestBedBuilder<TClass> implements TestBedBuilder<TClass> {
  protected readonly identifiersToBeMocked: IdentifierToMockImplWithCb[] = [];
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
        this.identifiersToBeMocked.push([
          normalizeIdentifier(identifier, metadata as never),
          mockImplementation,
        ]);

        return this;
      },
      final: (finalImplementation: FinalValue<TDependency>): TestBedBuilder<TClass> => {
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
