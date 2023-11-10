/// <reference types="jest" />

import { Type } from '@automock/types';
export * from './testbed-factory';

declare module '@automock/core' {
  /**
   * Provides a reference to mock objects that have been mocked for testing
   * purposes within the test environment.
   *
   * Augmentation of the `@automock/core` module for the `StubbedInstance` type.
   * In this context, the `StubbedInstance` type is replaced by `jest.Mocked`.
   *
   * Essentially, when you retrieve an instance using this interface, you're not getting
   * the original instance but a Jest-mocked version of it, allowing for enhanced testing
   * capabilities like spying on method calls, faking return values, and more.
   *
   * @see https://automock.dev/api-reference/api/unitreference-api
   */
  export interface UnitReference {
    /**
     * Retrieves a reference to the mocked object of a dependency corresponding to its type identifier.
     *
     * @template TDependency The type of the dependency being retrieved.
     * @param type The type representing the dependency.
     * @returns The mocked object corresponding to the provided type identifier.
     */
    get<TDependency>(type: Type<TDependency>): jest.Mocked<TDependency>;

    /**
     * Retrieves a reference to the mocked object of a dependency corresponding to a string-based token.
     *
     * @template TDependency The type of the dependency being retrieved.
     * @param token The string-based token representing the dependency.
     * @returns The mocked object corresponding to the provided string-based token.
     */
    get<TDependency>(token: string): jest.Mocked<TDependency>;

    /**
     * Retrieves a reference to the mocked object of a dependency corresponding to a symbol-based token.
     *
     * @since 2.0.0
     * @template TDependency The type of the dependency being retrieved.
     * @param token The symbol-based token representing the dependency.
     * @returns The mocked object corresponding to the provided symbol-based token.
     */
    get<TDependency>(token: symbol): jest.Mocked<TDependency>;

    /**
     * Retrieves a mocked object or a constant value of a dependency using its type, string, or symbol token.
     *
     * This method provides flexibility in retrieving dependencies by allowing various identifier types.
     * Depending on the identifier and the setup, it can return either a mocked object or a constant value.
     *
     * @since 2.0.0
     * @template TDependency The type of the dependency being retrieved.
     * @param identifier The type or token that the dependency corresponds to.
     * @returns The mocked object corresponding to the provided identifier.
     */
    get<TDependency>(identifier: Type<TDependency> | string | symbol): jest.Mocked<TDependency>;
  }
}
