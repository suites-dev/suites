import { isDeepStrictEqual } from 'node:util';
import type { StubbedInstance } from '@suites/types.doubles';
import type { IdentifierMetadata, InjectableIdentifier } from '@suites/types.di';
import type { Type } from '@suites/types.common';
import { DependencyResolutionError } from '@suites/types.common';
import type { DependencyContainer, IdentifierToFinal } from './dependency-container';
import { referenceDependencyNotFoundError, stringifyIdentifier } from './functions.static';
import { normalizeIdentifier } from '../normalize-identifier.static';

/**
 * Provides access to mocked dependencies within a test environment.
 *
 * The `UnitReference` interface allows retrieving mocked instances of dependencies
 * after `TestBed.compile()` has been called. This is essential for configuring
 * mock behaviors and verifying interactions during tests.
 *
 * @since 3.0.0
 * @see {@link https://suites.dev/docs/api-reference/unit-reference | UnitReference API Reference}
 *
 * @example
 * ```ts
 * const { unit, unitRef } = await TestBed.solitary(UserService).compile();
 *
 * // Retrieve mocked dependencies by class type
 * const userRepo = unitRef.get(UserRepository);
 * userRepo.findById.mockResolvedValue(testUser);
 *
 * // Retrieve by string token
 * const config = unitRef.get<AppConfig>('APP_CONFIG');
 *
 * // Retrieve by symbol token
 * const logger = unitRef.get<Logger>(LOGGER_TOKEN);
 * ```
 */
export interface UnitReference {
  /**
   * Retrieves a mocked dependency by its class type.
   *
   * @template TDependency The type of the dependency being retrieved.
   * @param type - The class constructor representing the dependency.
   * @returns The mocked instance of the dependency.
   * @throws {@link DependencyResolutionError} If the dependency is not found or is exposed/final.
   */
  get<TDependency>(type: Type<TDependency>): StubbedInstance<TDependency>;

  /**
   * Retrieves a mocked dependency by its class type with additional metadata.
   *
   * @template TDependency The type of the dependency being retrieved.
   * @param type - The class constructor representing the dependency.
   * @param identifierMetadata - Additional metadata for identifying the dependency.
   * @returns The mocked instance of the dependency.
   * @throws {@link DependencyResolutionError} If the dependency is not found or is exposed/final.
   */
  get<TDependency>(
    type: Type<TDependency>,
    identifierMetadata: IdentifierMetadata
  ): StubbedInstance<TDependency>;

  /**
   * Retrieves a mocked dependency by a string-based token.
   *
   * @template TDependency The type of the dependency being retrieved.
   * @param token - The string token representing the dependency.
   * @returns The mocked instance of the dependency.
   * @throws {@link DependencyResolutionError} If the dependency is not found or is exposed/final.
   */
  get<TDependency>(token: string): StubbedInstance<TDependency>;

  /**
   * Retrieves a mocked dependency by a string-based token with additional metadata.
   *
   * @template TDependency The type of the dependency being retrieved.
   * @param token - The string token representing the dependency.
   * @param identifierMetadata - Additional metadata for identifying the dependency.
   * @returns The mocked instance of the dependency.
   * @throws {@link DependencyResolutionError} If the dependency is not found or is exposed/final.
   */
  get<TDependency>(
    token: string,
    identifierMetadata: IdentifierMetadata
  ): StubbedInstance<TDependency>;

  /**
   * Retrieves a mocked dependency by a symbol-based token.
   *
   * @template TDependency The type of the dependency being retrieved.
   * @param token - The symbol token representing the dependency.
   * @returns The mocked instance of the dependency.
   * @throws {@link DependencyResolutionError} If the dependency is not found or is exposed/final.
   */
  get<TDependency>(token: symbol): StubbedInstance<TDependency>;

  /**
   * Retrieves a mocked dependency by a symbol-based token with additional metadata.
   *
   * @template TDependency The type of the dependency being retrieved.
   * @param token - The symbol token representing the dependency.
   * @param identifierMetadata - Additional metadata for identifying the dependency.
   * @returns The mocked instance of the dependency.
   * @throws {@link DependencyResolutionError} If the dependency is not found or is exposed/final.
   */
  get<TDependency>(
    token: symbol,
    identifierMetadata: IdentifierMetadata
  ): StubbedInstance<TDependency>;

  /**
   * Retrieves a mocked dependency using a flexible identifier.
   *
   * @template TDependency The type of the dependency being retrieved.
   * @param identifier - The class type, string, or symbol representing the dependency.
   * @param identifierMetadata - Optional metadata for identifying the dependency.
   * @returns The mocked instance of the dependency.
   * @throws {@link DependencyResolutionError} If the dependency is not found or is exposed/final.
   */
  get<TDependency>(
    identifier: Type<TDependency> | string | symbol,
    identifierMetadata?: IdentifierMetadata
  ): StubbedInstance<TDependency>;

  /**
   * Retrieves a mocked dependency using an injectable identifier.
   *
   * @template TDependency The type of the dependency being retrieved.
   * @param identifier - The injectable identifier representing the dependency.
   * @param identifierMetadata - Optional metadata for identifying the dependency.
   * @returns The mocked instance of the dependency.
   * @throws {@link DependencyResolutionError} If the dependency is not found or is exposed/final.
   */
  get<TDependency>(
    identifier: InjectableIdentifier<TDependency>,
    identifierMetadata?: IdentifierMetadata
  ): StubbedInstance<TDependency>;
}

/**
 * Implementation of the UnitReference interface that provides access to mocked dependencies.
 *
 * @since 3.0.0
 * @see {@link https://suites.dev/docs/api-reference/unit-reference | UnitReference API Reference}
 */
export class UnitReference {
  public constructor(
    private readonly mocksContainer: DependencyContainer,
    private readonly exposedInstances: InjectableIdentifier[],
    private readonly fakedDependencies: IdentifierToFinal[]
  ) {}

  public get<TDependency>(type: Type<TDependency>): StubbedInstance<TDependency>;
  public get<TDependency>(
    type: Type<TDependency>,
    identifierMetadata: IdentifierMetadata
  ): StubbedInstance<TDependency>;
  public get<TDependency>(token: string): StubbedInstance<TDependency>;
  public get<TDependency>(
    token: string,
    identifierMetadata: IdentifierMetadata
  ): StubbedInstance<TDependency>;
  public get<TDependency>(token: symbol): StubbedInstance<TDependency>;
  public get<TDependency>(
    token: symbol,
    identifierMetadata: IdentifierMetadata
  ): StubbedInstance<TDependency>;
  public get<TDependency>(
    identifier: Type<TDependency> | string | symbol,
    identifierMetadata?: IdentifierMetadata
  ): StubbedInstance<TDependency>;
  public get<TDependency>(
    identifier: InjectableIdentifier<TDependency>,
    identifierMetadata?: IdentifierMetadata
  ): StubbedInstance<TDependency> {
    const injectableIdentifier = normalizeIdentifier(identifier, identifierMetadata as never);

    if (
      this.fakedDependencies
        .map(([identifier]) => identifier)
        .some((id) => isDeepStrictEqual(id, injectableIdentifier))
    ) {
      const identifierString = stringifyIdentifier(identifier, identifierMetadata);

      throw new DependencyResolutionError(`The dependency associated with the specified identifier ${identifierString} could not be retrieved from the
current testing context, as it is marked as a faked dependency.
Faked dependencies are not intended for direct retrieval and should be accessed through the appropriate
testing context or container. Refer to the docs for further information: https://suites.dev/docs`);
    }

    if (typeof identifier === 'function' && this.exposedInstances.includes(identifier)) {
      throw new DependencyResolutionError(`The dependency associated with the specified identifier '${identifier.name}' could not be retrieved from the
current testing context, as it is marked as an exposed dependency.
Exposed dependencies are not intended for direct retrieval and should be accessed through the appropriate
testing context or container. Refer to the docs for further information: https://suites.dev/docs`);
    }

    const dependency = this.mocksContainer.resolve<TDependency>(identifier, identifierMetadata);

    if (!dependency) {
      const message = referenceDependencyNotFoundError(identifier, identifierMetadata);
      throw new DependencyResolutionError(message);
    }

    return dependency as StubbedInstance<TDependency>;
  }
}
