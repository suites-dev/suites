/// <reference types="jest" />

import { Type as TypeFromTypes } from '@automock/types';
import { MockOverride, TestBedBuilder, UnitReference } from '@automock/core';
import { mock } from 'jest-mock-extended';

export * from './testbed-factory';

/**
 * @deprecated Use `TestBedBuilder` from `@automock/core` instead of `TestBedResolver` from `@automock/jest`.
 */
export type TestBedResolver<TClass> = TestBedBuilder<TClass>;

export type Type<T> = TypeFromTypes<T>;

declare module '@automock/core' {
  /**
   * Represents a reference to the mocked object based on the provided type or token.
   * This is an augmented module for the `StubbedInstance` type from @automock/core.
   */
  export interface UnitReference {
    /**
     * Returns a reference to the mocked object based on the provided class type.
     *
     * @param type - The type of the dependency.
     * @returns The mocked instance of the dependency.
     * @template TDep - The type of the dependency.
     */
    get<TDep>(type: Type<TDep>): jest.Mocked<TDep>;

    /**
     * Returns a reference to the mocked object based on the provided token.
     *
     * @param token - The token of the dependency.
     * @returns The mocked instance of the dependency.
     * @template TDep - The type of the dependency.
     */
    get<TDep>(token: string): jest.Mocked<TDep>;

    /**
     * Returns a reference to the mocked object based on the provided token or class type.
     *
     * @param typeOrToken - The type or token of the dependency.
     * @returns The mocked instance of the dependency.
     * @template TDep - The type of the dependency.
     */
    get<TDep>(typeOrToken: Type<TDep> | string): jest.Mocked<TDep>;
  }
}

/**
 * @deprecated Use `MockOverride` from `@automock/core` instead.
 */
export type Override<T> = MockOverride<any, T>;

/**
 * Represents the result of compiling a unit test bed.
 * @template TClass - The type of the class under test.
 */
export interface UnitTestBed<TClass> {
  /**
   * The instance of the class under test.
   */
  unit: TClass;

  /**
   * The reference to the dependencies of the class under test.
   */
  unitRef: UnitReference;
}

/**
 * @deprecated Will be removed in the next major version.
 */
export type MockFunction = typeof mock;
