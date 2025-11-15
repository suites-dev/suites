import { isDeepStrictEqual } from 'node:util';
import type { StubbedInstance } from '@suites/types.doubles';
import type { IdentifierMetadata, InjectableIdentifier } from '@suites/types.di';
import type { Type } from '@suites/types.common';
import { DependencyResolutionError } from '@suites/types.common';
import type { DependencyContainer, IdentifierToFinal } from './dependency-container.js';
import { referenceDependencyNotFoundError, stringifyIdentifier } from './functions.static.js';
import { normalizeIdentifier } from '../normalize-identifier.static.js';

export interface UnitReference {
  get<TDependency>(type: Type<TDependency>): StubbedInstance<TDependency>;
  get<TDependency>(
    type: Type<TDependency>,
    identifierMetadata: IdentifierMetadata
  ): StubbedInstance<TDependency>;
  get<TDependency>(token: string): StubbedInstance<TDependency>;
  get<TDependency>(
    token: string,
    identifierMetadata: IdentifierMetadata
  ): StubbedInstance<TDependency>;
  get<TDependency>(token: symbol): StubbedInstance<TDependency>;
  get<TDependency>(
    token: symbol,
    identifierMetadata: IdentifierMetadata
  ): StubbedInstance<TDependency>;
  get<TDependency>(
    identifier: Type<TDependency> | string | symbol,
    identifierMetadata?: IdentifierMetadata
  ): StubbedInstance<TDependency>;
  get<TDependency>(
    identifier: InjectableIdentifier<TDependency>,
    identifierMetadata?: IdentifierMetadata
  ): StubbedInstance<TDependency>;
}

/**
 * Core implementation of the UnitReference interface that manages access to mocked dependencies.
 *
 * This class serves as the dependency resolution layer in the test environment, providing
 * controlled access to mocked instances while enforcing restrictions on exposed and faked dependencies.
 * It validates dependency access and throws appropriate errors when dependencies are accessed incorrectly.
 *
 * @internal This is an internal implementation class used by TestBed builders
 * @since 3.0.0
 * @see https://suites.dev/docs/api-reference/unit-reference
 */
export class UnitReference {
  /**
   * Creates a new UnitReference instance with dependency containers and access restrictions.
   *
   * @param mocksContainer Container holding all mocked dependency instances
   * @param exposedInstances List of identifiers for real dependencies in sociable tests (not mocked)
   * @param fakedDependencies List of dependencies replaced with .final() implementations
   */
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
  /**
   * Retrieves a mocked dependency instance from the test environment.
   *
   * This method performs three validation checks before returning the mock:
   * 1. **Faked Dependency Check**: Throws if the dependency was configured with `.final()`,
   *    as faked dependencies are injected directly into the unit under test and not retrievable.
   * 2. **Exposed Dependency Check**: Throws if the dependency was marked with `.expose()` in
   *    sociable tests, as exposed dependencies are real instances, not mocks.
   * 3. **Existence Check**: Throws if the dependency doesn't exist in the mocks container,
   *    typically because it wasn't declared with `.mock()`.
   *
   * @since 3.0.0
   * @template TDependency The type of the dependency being retrieved
   * @param identifier The dependency identifier (class type, string token, or symbol token)
   * @param identifierMetadata Optional metadata for token-based dependencies
   * @returns The mocked instance of the dependency
   * @throws {DependencyResolutionError} If dependency is faked, exposed, or not found
   *
   * @example
   * // Retrieve a mocked dependency
   * const mockLogger = unitRef.get(Logger);
   * mockLogger.log.mockReturnValue('test');
   */
  public get<TDependency>(
    identifier: InjectableIdentifier<TDependency>,
    identifierMetadata?: IdentifierMetadata
  ): StubbedInstance<TDependency> {
    const injectableIdentifier = normalizeIdentifier(identifier, identifierMetadata as never);

    // Validation 1: Prevent access to faked dependencies (configured with .final())
    if (
      this.fakedDependencies
        .map(([identifier]) => identifier)
        .some((id) => isDeepStrictEqual(id, injectableIdentifier))
    ) {
      const identifierString = stringifyIdentifier(identifier, identifierMetadata);

      throw new DependencyResolutionError(`The dependency associated with the specified identifier ${identifierString} could not be retrieved from the
current testing context, as it is marked as a faked dependency.
Faked dependencies are not intended for direct retrieval and should be accessed through the appropriate
testing context or container. Refer to the docs for further information: https://suites.dev/docs/api-reference/unit-reference`);
    }

    // Validation 2: Prevent access to exposed dependencies (configured with .expose())
    if (typeof identifier === 'function' && this.exposedInstances.includes(identifier)) {
      throw new DependencyResolutionError(`The dependency associated with the specified identifier '${identifier.name}' could not be retrieved from the
current testing context, as it is marked as an exposed dependency.
Exposed dependencies are not intended for direct retrieval and should be accessed through the appropriate
testing context or container. Refer to the docs for further information: https://suites.dev/docs/api-reference/unit-reference`);
    }

    // Resolve the dependency from the mocks container
    const dependency = this.mocksContainer.resolve<TDependency>(identifier, identifierMetadata);

    // Validation 3: Ensure the dependency exists in the container
    if (!dependency) {
      const message = referenceDependencyNotFoundError(identifier, identifierMetadata);
      throw new DependencyResolutionError(message);
    }

    return dependency as StubbedInstance<TDependency>;
  }
}
