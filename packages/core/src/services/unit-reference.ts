import { StubbedInstance } from '@suites/types.doubles';
import {
  IdentifierMetadata,
  InjectableIdentifier,
  IdentifierNotFoundError,
} from '@suites/types.di';
import { ConstantValue, Type } from '@suites/types.common';
import { DependencyContainer } from './dependency-container';
import { referenceDependencyNotFoundError } from './functions.static';

export class UnitReference {
  public constructor(
    private readonly mocksContainer: DependencyContainer,
    private readonly exposedInstances: Type[]
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

  public get<TDependency, TValue extends ConstantValue = ConstantValue>(
    identifier: InjectableIdentifier<TDependency>,
    identifierMetadata?: IdentifierMetadata
  ): StubbedInstance<TDependency> | TValue {
    if (typeof identifier === 'function' && this.exposedInstances.includes(identifier)) {
      const message = referenceDependencyNotFoundError(identifier, identifierMetadata);
      throw new IdentifierNotFoundError(message);
    }

    const dependency = this.mocksContainer.resolve<TDependency>(identifier, identifierMetadata);

    if (!dependency) {
      const message = referenceDependencyNotFoundError(identifier, identifierMetadata);
      throw new IdentifierNotFoundError(message);
    }

    return dependency as StubbedInstance<TDependency> | TValue;
  }
}
