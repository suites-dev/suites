import isEqual from 'lodash.isequal';
import type { ClassInjectable, IdentifierMetadata, InjectableIdentifier } from '@suites/types.di';
import type { Stub, StubbedInstance } from '@suites/types.doubles';
import type { ConstantValue, DeepPartial, FinalValue } from '@suites/types.common';

export type IdentifierToMockOrFinal = [
  Pick<ClassInjectable, 'identifier'> & { metadata?: unknown },
  StubbedInstance<unknown> | FinalValue,
];

export type IdentifierToFinal = [
  Pick<ClassInjectable, 'identifier'> & { metadata?: never },
  FinalValue,
];

export type IdentifierToMockImplWithCb = [
  Pick<ClassInjectable, 'identifier'> & { metadata?: unknown },
  (stubFn: () => Stub<unknown, any[]>) => DeepPartial<unknown>,
];

export interface DependencyContainer {
  resolve<TDependency = unknown>(
    identifier: InjectableIdentifier<TDependency>,
    metadata?: IdentifierMetadata
  ): StubbedInstance<TDependency> | ConstantValue;
}

export class DependencyContainer {
  public constructor(private readonly identifierToDependency: IdentifierToMockOrFinal[]) {}

  public resolve<TDependency = unknown>(
    identifier: InjectableIdentifier<TDependency>,
    metadata?: IdentifierMetadata
  ): StubbedInstance<TDependency> | ConstantValue | undefined {
    // If there is one identifier, it is enough to match, no need to check metadata
    const identifiers = this.identifierToDependency.filter(
      ([{ identifier: injectableIdentifier }]) => injectableIdentifier === identifier
    );

    if (identifiers.length === 0) {
      return undefined;
    }

    if (identifiers.length === 1 && !metadata) {
      return identifiers[0][1] as StubbedInstance<TDependency> | ConstantValue;
    }

    // If there are more than one injectable with the same identifier, we need to check the metadata as well
    if (metadata) {
      const identifierToMock = identifiers.find(([{ metadata: injectableMetadata }]) =>
        isEqual(injectableMetadata, metadata)
      );

      return identifierToMock
        ? (identifierToMock[1] as StubbedInstance<TDependency> | ConstantValue)
        : undefined;
    }

    const foundIdentifier = this.identifierToDependency.find(
      ([{ identifier: injectableIdentifier, metadata }]) =>
        injectableIdentifier === identifier && typeof metadata === 'undefined'
    );

    return foundIdentifier
      ? (foundIdentifier[1] as StubbedInstance<TDependency> | ConstantValue)
      : undefined;
  }

  public list(): IdentifierToMockOrFinal[] {
    return this.identifierToDependency;
  }
}
