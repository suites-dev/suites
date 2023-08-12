/// <reference types="jest" />

import { Type } from '@automock/types';
import { IdentifierMetadata } from '@automock/common';

export * from './testbed-factory';

declare module '@automock/core' {
  /**
   * Represents a reference to the mocked object based on the provided type or token.
   * This is an augmented module for the `StubbedInstance` type from @automock/core.
   */
  export interface UnitReference {
    /**
     * Returns a reference to the mocked object based on the provided class type.
     *
     * @param identifier - The type of the dependency.
     * @returns The mocked instance of the dependency.
     * @template TDep - The type of the dependency.
     */
    get<TDep>(identifier: Type<TDep>): jest.Mocked<TDep>;

    /**
     * Returns a reference to the mocked object based on the provided token.
     *
     * @param identifier - The token of the dependency.
     * @returns The mocked instance of the dependency.
     * @template TDep - The type of the dependency.
     */
    get<TDep>(identifier: string): jest.Mocked<TDep>;

    /**
     * Returns a reference to the mocked object based on the provided token and metadata.
     *
     * @param identifier - The token of the dependency.
     * @param metadata - The metadata to identify the dependency.
     * @returns The mocked instance of the dependency.
     * @template TDep - The type of the dependency.
     */
    get<TDep>(identifier: string, metadata: IdentifierMetadata): jest.Mocked<TDep>;

    /**
     * Returns a reference to the mocked object based on the provided token or class type.
     *
     * @param identifier - The type or token of the dependency.
     * @param metadata - The metadata to identify the dependency.
     * @returns The mocked instance of the dependency.
     * @template TDep - The type of the dependency.
     */
    get<TDep>(identifier: Type<TDep> | string, metadata?: IdentifierMetadata): jest.Mocked<TDep>;
  }
}
