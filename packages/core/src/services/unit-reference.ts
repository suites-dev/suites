import { StubbedInstance } from '@suites/types.doubles';
import {
  IdentifierMetadata,
  InjectableIdentifier,
  IdentifierNotFoundError,
} from '@suites/types.di';
import { MocksContainer } from './mocks-container';
import { ConstantValue, Type } from '@suites/types.common';

export class UnitReference {
  public constructor(private readonly mocksContainer: MocksContainer) {}

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

  public get<TDependency, TValue extends ConstantValue = ConstantValue>(
    identifier: InjectableIdentifier<TDependency>,
    identifierMetadata?: IdentifierMetadata
  ): StubbedInstance<TDependency> | TValue {
    const dependency = this.mocksContainer.resolve<TDependency>(identifier, identifierMetadata);

    if (!dependency) {
      const message = referenceDependencyNotFoundError(identifier, identifierMetadata);
      throw new IdentifierNotFoundError(message);
    }

    return dependency as StubbedInstance<TDependency> | TValue;
  }

  spread(
    ...identifiers: InjectableIdentifier[]
  ): (StubbedInstance<InjectableIdentifier> | ConstantValue)[] {
    return identifiers.map((identifier) => this.get(identifier));
  }
}

function referenceDependencyNotFoundError(
  identifier: Type | string | symbol,
  metadata: IdentifierMetadata | undefined
): string {
  const identifierName =
    typeof identifier === 'string' || typeof identifier === 'symbol'
      ? String(identifier)
      : identifier.name;
  const metadataMsg = metadata ? `, with metadata ${JSON.stringify(metadata)}` : '';
  const details = `'${identifierName}'${metadataMsg}`;

  return `The dependency associated with the specified token or identifier (${details}) could not be located within
the current testing context. This issue pertains to the usage of the UnitReference API.
Please ensure accurate spelling and correspondence between the provided token or identifier and the corresponding
injection configuration. If you are utilizing a custom token, it is essential to confirm its proper registration
within the DI container.

Refer to the docs for further information: https://suites.dev/docs`;
}
