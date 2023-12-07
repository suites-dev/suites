import isEqual from 'lodash.isequal';
import {
  ClassInjectable,
  ConstantValue,
  IdentifierMetadata,
  InjectableIdentifier,
} from '@automock/common';
import { StubbedInstance } from '@automock/types';

export type IdentifierToMock = [
  Pick<ClassInjectable, 'identifier'> & { metadata?: unknown },
  StubbedInstance<unknown> | ConstantValue,
];

export interface MocksContainer {
  resolve<TDependency = unknown>(
    identifier: InjectableIdentifier,
    metadata?: IdentifierMetadata
  ): StubbedInstance<TDependency> | ConstantValue;
}

export class MocksContainer {
  public constructor(private readonly identifierToMocksTuples: IdentifierToMock[]) {}

  public resolve<TDependency = unknown>(
    identifier: InjectableIdentifier,
    metadata?: IdentifierMetadata
  ): StubbedInstance<TDependency> | ConstantValue | undefined {
    // If there is one identifier, it is enough to match, no need to check metadata
    const identifiers = this.identifierToMocksTuples.filter(
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

    const foundIdentifier = this.identifierToMocksTuples.find(
      ([{ identifier: injectableIdentifier, metadata }]) =>
        injectableIdentifier === identifier && typeof metadata === 'undefined'
    );

    return foundIdentifier
      ? (foundIdentifier[1] as StubbedInstance<TDependency> | ConstantValue)
      : undefined;
  }

  public list() {
    return this.identifierToMocksTuples;
  }
}
