/// <reference types="@types/sinon" />
/// <reference types="@suites/unit" />

import type { SinonStubbedInstance } from 'sinon';
import type { UnitReference as UnitReferenceCore } from '@suites/core.unit';
import type { Type } from '@suites/types.common';
import type { IdentifierMetadata } from '@suites/types.di';
import { mock } from './mock.static';

declare module '@suites/unit' {
  /**
   * The UnitReference interface represents a reference to a unit object.
   * It provides methods to retrieve mocked objects of dependencies based
   * on their type or identifier. This extension integrates Sinon mocking capabilities.
   *
   * @since 3.0.0
   * @see https://suites.dev/docs/api-reference
   */
  export interface UnitReference extends UnitReferenceCore {
    /**
     * Retrieves a reference to the mocked object of a dependency corresponding
     * to its type identifier.
     *
     * @since 3.0.0
     * @template TDependency The type of the dependency being retrieved.
     * @param type The type representing the dependency.
     * @throws {IdentifierNotFoundError} - If the dependency is not found.
     * @returns {SinonStubbedInstance<TDependency>} The mocked object corresponding to the provided type identifier.
     * @see https://suites.dev/docs/api-reference
     * @example
     * const mockedService = unitRef.get<MyService>(MyService);
     */
    get<TDependency>(type: Type<TDependency>): SinonStubbedInstance<TDependency>;

    /**
     * Retrieves a reference to the mocked object of a dependency corresponding to its
     * type identifier and the identifier metadata.
     *
     * @since 3.0.0
     * @template TDependency The type of the dependency being retrieved.
     * @param type The type representing the dependency.
     * @param identifierMetadata An accompanying metadata object for the token identifier.
     * @throws {IdentifierNotFoundError} - If the dependency is not found.
     * @returns {SinonStubbedInstance<TDependency>} The mocked object corresponding to the provided type identifier and identifier metadata.
     * @see https://suites.dev/docs/api-reference
     * @example
     * const mockedService = unitRef.get<MyService>(MyService, metadata);
     */
    get<TDependency>(
      type: Type<TDependency>,
      identifierMetadata: IdentifierMetadata
    ): SinonStubbedInstance<TDependency>;

    /**
     * Retrieves a reference to the mocked object of a dependency corresponding to a
     * string-based token.
     *
     * @since 3.0.0
     * @template TDependency The type of the dependency being retrieved.
     * @param token The string-based token representing the dependency.
     * @throws {IdentifierNotFoundError} - If the dependency is not found.
     * @returns {SinonStubbedInstance<TDependency>} The mocked object corresponding to the provided string-based token.
     * @see https://suites.dev/docs/api-reference
     * @example
     * const mockedService = unitRef.get<MyService>('MyService');
     */
    get<TDependency>(token: string): SinonStubbedInstance<TDependency>;

    /**
     * Retrieves a reference to the mocked object of a dependency corresponding to its
     * string-based identifier and the identifier metadata.
     *
     * @since 3.0.0
     * @template TDependency The type of the dependency being retrieved.
     * @param token The string-based token representing the dependency.
     * @param identifierMetadata An accompanying metadata object for the token identifier.
     * @throws {IdentifierNotFoundError} - If the dependency is not found.
     * @returns {SinonStubbedInstance<TDependency>} The mocked object corresponding to the provided string-based token and identifier metadata.
     * @see https://suites.dev/docs/api-reference
     * @example
     * const mockedService = unitRef.get<MyService>('MyService', metadata);
     */
    get<TDependency>(
      token: string,
      identifierMetadata: IdentifierMetadata
    ): SinonStubbedInstance<TDependency>;

    /**
     * Retrieves a reference to the mocked object of a dependency corresponding to a
     * symbol-based token.
     *
     * @since 3.0.0
     * @template TDependency The type of the dependency being retrieved.
     * @param token The symbol-based token representing the dependency.
     * @throws {IdentifierNotFoundError} - If the dependency is not found.
     * @returns {SinonStubbedInstance<TDependency>} The mocked object corresponding to the provided symbol-based token.
     * @see https://suites.dev/docs/api-reference
     * @example
     * const mockedService = unitRef.get<MyService>(MY_SERVICE_SYMBOL);
     */
    get<TDependency>(token: symbol): SinonStubbedInstance<TDependency>;

    /**
     * Retrieves a reference to the mocked object of a dependency corresponding to its
     * symbol-based identifier and the identifier metadata.
     *
     * @since 3.0.0
     * @template TDependency The type of the dependency being retrieved.
     * @param token The symbol-based token representing the dependency.
     * @param identifierMetadata An accompanying metadata object for the token identifier.
     * @throws {IdentifierNotFoundError} - If the dependency is not found.
     * @returns {SinonStubbedInstance<TDependency>} The mocked object corresponding to the provided symbol-based token and identifier metadata.
     * @see https://suites.dev/docs/api-reference
     * @example
     * const mockedService = unitRef.get<MyService>(MY_SERVICE_SYMBOL, metadata);
     */
    get<TDependency>(
      token: symbol,
      identifierMetadata: IdentifierMetadata
    ): SinonStubbedInstance<TDependency>;

    /**
     * Retrieves a reference to the mocked object of a dependency corresponding to its
     * type, string-based or symbol-based identifier and the identifier metadata if present.
     *
     * @since 3.0.0
     * @template TDependency The type of the dependency being retrieved.
     * @param identifier The type or token that the dependency corresponds to.
     * @param identifierMetadata An accompanying metadata object for the token identifier.
     * @throws {IdentifierNotFoundError} - If the dependency is not found.
     * @returns {SinonStubbedInstance<TDependency>} The mocked object corresponding to the provided identifier, along with any available identifier metadata.
     * @see https://suites.dev/docs/api-reference
     * @example
     * const mockedService = unitRef.get<MyService>(MyService, metadata);
     * // or
     * const mockedService = unitRef.get<MyService>('MyService');
     * // or
     * const mockedService = unitRef.get<MyService>(MY_SERVICE_SYMBOL, metadata);
     */
    get<TDependency>(
      identifier: Type<TDependency> | string | symbol,
      identifierMetadata?: IdentifierMetadata
    ): SinonStubbedInstance<TDependency>;
  }
}

export { mock } from './mock.static';
export type Mocked<TType> = SinonStubbedInstance<TType>;

/**
 * Adapter for a Sinon mocking library to be used with Suites framework.
 *
 * @see https://suites.dev/docs/api-reference
 * @since 3.0.0
 * @example
 * import { adapter as mock } from '@suites/doubles.jest';
 *
 * const mockedService = mock<MyService>(MyService);
 */
export const adapter = mock;
