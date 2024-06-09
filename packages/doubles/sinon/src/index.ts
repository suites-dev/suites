/// <reference types="@types/sinon" />
/// <reference types="@suites/unit" />

import type { SinonStubbedInstance } from 'sinon';
import type { UnitReference as CoreUnitReference } from '@suites/core.unit';
import type { Type } from '@suites/types.common';
import type { IdentifierMetadata } from '@suites/types.di';
import { mock } from './mock.static';

/**
 * Provides a reference to mock objects that have been mocked for testing
 * purposes within the test environment.
 *
 * Augmentation of the `@suites/unit` module for the `StubbedInstance` type.
 * In this context, the `StubbedInstance` type is replaced by `SinonStubbedInstance`.
 *
 * Essentially, when you retrieve an instance using this interface, you're not getting
 * the original instance but a Sinon-mocked version of it, allowing for enhanced testing
 * capabilities like spying on method calls, faking return values, and more.
 *
 * @see https://suites.dev/api-reference/api/unitreference-api
 */
declare module '@suites/unit' {
  export interface UnitReference extends CoreUnitReference {
    /**
     * Retrieves a reference to the mocked object of a dependency corresponding to its type
     * identifier.
     *
     * @template TDependency The type of the dependency being retrieved.
     * @param type The type representing the dependency.
     * @returns The mocked object corresponding to the provided type identifier.
     */
    get<TDependency>(type: Type<TDependency>): SinonStubbedInstance<TDependency>;

    /**
     * Retrieves a reference to the mocked object of a dependency corresponding to its
     * type identifier and the identifier metadata.
     *
     * @since 2.1.0
     * @template TDependency The type of the dependency being retrieved.
     * @param type The type representing the dependency
     * @param identifierMetadata An accompanying metadata object for the token identifier.
     * @returns SinonStubbedInstance<TDependency> The mocked object corresponding to the provided
     * type identifier and identifier metadata.
     */
    get<TDependency>(
      type: Type<TDependency>,
      identifierMetadata: IdentifierMetadata
    ): SinonStubbedInstance<TDependency>;

    /**
     * Retrieves a reference to the mocked object of a dependency corresponding to a string-based
     * token.
     *
     * @template TDependency The type of the dependency being retrieved.
     * @param token The string-based token representing the dependency.
     * @returns SinonStubbedInstance<TDependency> The mocked object corresponding to the provided
     * string-based token.
     */
    get<TDependency>(token: string): SinonStubbedInstance<TDependency>;

    /**
     * Retrieves a reference to the mocked object of a dependency corresponding to its
     * string-based identifier and the identifier metadata.
     *
     * @since 2.1.0
     * @template TDependency The type of the dependency being retrieved.
     * @param token The string-based token representing the dependency.
     * @param identifierMetadata An accompanying metadata object for the token identifier.
     * @returns SinonStubbedInstance<TDependency> The mocked object corresponding to the provided
     * string-based token and identifier metadata.
     */
    get<TDependency>(
      token: string,
      identifierMetadata: IdentifierMetadata
    ): SinonStubbedInstance<TDependency>;

    /**
     * Retrieves a reference to the mocked object of a dependency corresponding to a symbol-based
     * token.
     *
     * @since 2.0.0
     * @template TDependency The type of the dependency being retrieved.
     * @param token The symbol-based token representing the dependency.
     * @returns SinonStubbedInstance<TDependency> The mocked object corresponding to the provided
     * symbol-based token.
     */
    get<TDependency>(token: symbol): SinonStubbedInstance<TDependency>;

    /**
     * Retrieves a reference to the mocked object of a dependency corresponding to its
     * symbol-based identifier and the identifier metadata.
     *
     * @since 2.1.0
     * @template TDependency The type of the dependency being retrieved.
     * @param token The symbol-based token representing the dependency.
     * @param identifierMetadata An accompanying metadata object for the token identifier.
     * @returns SinonStubbedInstance<TDependency> The mocked object corresponding to the provided
     * symbol-based token and identifier metadata.
     */
    get<TDependency>(
      token: symbol,
      identifierMetadata: IdentifierMetadata
    ): SinonStubbedInstance<TDependency>;

    /**
     * Retrieves a reference to the mocked object of a dependency corresponding to its
     * type, string-based or symbol-based identifier and the identifier metadata if present.
     *
     * This method provides flexibility in retrieving dependencies by allowing various identifier
     * types.
     *
     * @since 2.1.0
     * @template TDependency The type of the dependency being retrieved.
     * @param identifier The type or token that the dependency corresponds to.
     * @param identifierMetadata
     * @returns SinonStubbedInstance<TDependency> The mocked object corresponding to the provided
     * identifier, along with any available identifier metadata.
     */
    get<TDependency>(
      identifier: Type<TDependency> | string | symbol,
      identifierMetadata?: IdentifierMetadata
    ): SinonStubbedInstance<TDependency>;

    /**
     * Retrieves an array of mocked objects corresponding to an array of dependencies.
     *
     * @since @TODO
     * @template TDependency The type of the dependencies being retrieved.
     * @param identifiers An array of identifiers representing the dependencies.
     * @returns An array of mocked objects corresponding to the provided identifiers.
     */
    spread<TDependency>(
      ...identifiers: (Type<TDependency> | string | symbol)[]
    ): SinonStubbedInstance<TDependency>[];
  }
}

export { mock } from './mock.static';
export type Mocked<TType> = SinonStubbedInstance<TType>;

export const adapter = mock;
