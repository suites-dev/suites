import 'reflect-metadata';
import { AutomockDependenciesAdapter, IdentifierMetadata } from '@automock/common';
import { ClassPropsReflector } from './class-props-reflector';
import { ClassCtorReflector } from './class-ctor-reflector';
import { IdentifierBuilder } from './identifier-builder.static';
import { DependenciesAdapter } from './dependencies-adapter';
import { Type } from '@automock/types';
import { MockOverride, UnitReference as UnitReferenceCore } from '@automock/core';

const InversifyAutomockDependenciesAdapter: AutomockDependenciesAdapter = ((
  classPropsReflector: ClassPropsReflector,
  classCtorReflector: ClassCtorReflector
) => {
  return DependenciesAdapter(classPropsReflector, classCtorReflector);
})(
  ClassPropsReflector(Reflect, IdentifierBuilder()),
  ClassCtorReflector(Reflect, IdentifierBuilder())
);

export default InversifyAutomockDependenciesAdapter;

declare module '@automock/common' {
  interface IdentifierMetadata {
    [key: string]: unknown;
  }
}

declare module '@automock/core' {
  /**
   * Provides a reference to mock objects that have been mocked for testing
   * purposes within the test environment.
   *
   * Augmentation of the `@automock/core` module for the InversifyJS adapter.
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
     * @param metadata the identifier metadata if exists.
     * @returns The mocked object corresponding to the provided type identifier.
     */
    get<TDependency>(type: Type<TDependency>, metadata: IdentifierMetadata | undefined): UnitReferenceCore['get'];

    /**
     * Retrieves a reference to the mocked object of a dependency corresponding to a string-based token.
     *
     * @template TDependency The type of the dependency being retrieved.
     * @param token The string-based token representing the dependency.
     * @param metadata the identifier metadata if exists.
     * @returns The mocked object corresponding to the provided string-based token.
     */
    get<TDependency>(token: string, metadata: IdentifierMetadata | undefined): UnitReferenceCore['get'];

    /**
     * Retrieves a reference to the mocked object of a dependency corresponding to a symbol-based token.
     *
     * @since 2.0.0
     * @template TDependency The type of the dependency being retrieved.
     * @param token The symbol-based token representing the dependency.
     * @param metadata the identifier metadata if exists.
     * @returns The mocked object corresponding to the provided symbol-based token.
     */
    get<TDependency>(token: symbol, metadata: IdentifierMetadata | undefined): UnitReferenceCore['get'];

    /**
     * Retrieves a mocked object or a constant value of a dependency using its type, string, or symbol token.
     *
     * This method provides flexibility in retrieving dependencies by allowing various identifier types.
     * Depending on the identifier and the setup, it can return either a mocked object or a constant value.
     *
     * @since 2.0.0
     * @template TDependency The type of the dependency being retrieved.
     * @param identifier The type or token that the dependency corresponds to.
     * @param metadata the identifier metadata if exists.
     * @returns The mocked object corresponding to the provided identifier.
     */
    get<TDependency>(identifier: Type<TDependency> | string | symbol, metadata: IdentifierMetadata | undefined): UnitReferenceCore['get'];
  }

  export interface TestBedBuilder<TClass> {
    /**
     * Declares a dependency to be mocked using its type.
     *
     * @since 1.1.0
     * @param type The type of the dependency.
     * @param metadata the identifier metadata if exists.
     * @template TDependency The type of the dependency being mocked.
     * @returns MockOverride instance for further configuration.
     */
    mock<TDependency>(type: Type<TDependency>, metadata: IdentifierMetadata | undefined): MockOverride<TDependency, TClass>;

    /**
     * Declares a dependency to be mocked using a string-based token.
     *
     * @since 1.1.0
     * @param token The token string representing the dependency to be mocked.
     * @param metadata the identifier metadata if exists.
     * @template TDependency The type of the dependency being mocked.
     * @returns MockOverride instance for further configuration.
     */
    mock<TDependency>(token: string, metadata: IdentifierMetadata | undefined): MockOverride<TDependency, TClass>;

    /**
     * Declares a dependency to be mocked using a symbol-based token.
     *
     * @since 2.0.0
     * @param token - The token symbol representing the dependency to be mocked.
     * @param metadata the identifier metadata if exists.
     * @template TDependency The type of the dependency being mocked.
     * @returns MockOverride instance for further configuration.
     */
    mock<TDependency>(token: symbol, metadata: IdentifierMetadata | undefined): MockOverride<TDependency, TClass>;
  }
}