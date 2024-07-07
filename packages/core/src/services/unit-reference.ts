import isEqual from 'lodash.isequal';
import type { StubbedInstance } from '@suites/types.doubles';
import type { IdentifierMetadata, InjectableIdentifier } from '@suites/types.di';
import type { Type } from '@suites/types.common';
import { DependencyResolutionError } from '@suites/types.common';
import type { DependencyContainer, IdentifierToFinal } from './dependency-container';
import { referenceDependencyNotFoundError, stringifyIdentifier } from './functions.static';
import { normalizeIdentifier } from '../normalize-identifier.static';

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
        .some((id) => isEqual(id, injectableIdentifier))
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
