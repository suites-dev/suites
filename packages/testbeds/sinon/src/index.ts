/// <reference types="@types/sinon" />

import { Type } from '@automock/types';
import { SinonStubbedInstance } from 'sinon';
import { IdentifierMetadata } from '@automock/common';
export * from './testbed-factory';

declare module '@automock/core' {
  export interface UnitReference {
    /**
     * Returns a reference to the mocked object based on the provided class type.
     *
     * @param identifier - The type of the dependency.
     * @returns The mocked instance of the dependency.
     * @template TDependency - The type of the dependency.
     */
    get<TDependency>(identifier: Type<TDependency>): SinonStubbedInstance<TDependency>;

    /**
     * Returns a reference to the mocked object based on the provided token.
     *
     * @param identifier - The string-based token of the dependency.
     * @returns The mocked instance of the dependency.
     * @template TDependency - The type of the dependency.
     */
    get<TDependency>(identifier: string): SinonStubbedInstance<TDependency>;

    /**
     * Returns a reference to the mocked object based on the provided token.
     *
     * @param identifier - The symbol-based token of the dependency.
     * @returns The mocked instance of the dependency.
     * @template TDependency - The type of the dependency.
     */
    get<TDependency>(identifier: symbol): SinonStubbedInstance<TDependency>;

    /**
     * Returns a reference to the mocked object based on the provided token or class type.
     *
     * @param identifier - The type or token of the dependency.
     * @returns The mocked instance of the dependency.
     * @template TDependency - The type of the dependency.
     */
    get<TDependency>(identifier: Type | string | symbol): SinonStubbedInstance<TDependency>;
  }
}

declare module '@automock/adapters.inversify' {
  export interface UnitReference {
    /**
     * Returns a reference to the mocked object based on the provided string token and metadata.
     *
     * @param identifier - The string-based token of the dependency.
     * @param bindings - The bindings to identify the dependency.
     * @returns The mocked instance of the dependency.
     * @template TDependency - The type of the dependency.
     */
    get<TDependency>(
      identifier: string,
      bindings: IdentifierMetadata
    ): SinonStubbedInstance<TDependency>;

    /**
     * Returns a reference to the mocked object based on the provided symbol token and metadata.
     *
     * @param identifier - The symbol-based token of the dependency.
     * @param bindings - The bindings to identify the dependency.
     * @returns The mocked instance of the dependency.
     * @template TDependency - The type of the dependency.
     */
    get<TDependency>(
      identifier: symbol,
      bindings: IdentifierMetadata
    ): SinonStubbedInstance<TDependency>;

    /**
     * Returns a reference to the mocked object based on the provided token or class type.
     *
     * @param identifier - The type or token of the dependency.
     * @param bindings - The bindings to identify the dependency.
     * @returns The mocked instance of the dependency.
     * @template TDependency - The type of the dependency.
     */
    get<TDependency>(
      identifier: string | symbol,
      bindings: IdentifierMetadata
    ): SinonStubbedInstance<TDependency>;
  }
}
