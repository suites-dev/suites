import isEqual from 'lodash.isequal';
import {
  ClassInjectable,
  ConstantValue,
  IdentifierMetadata,
  InjectableIdentifier,
} from '@automock/common';
import { StubbedInstance } from '@automock/types';
import { normalizeIdentifier } from '../normalize-identifier.stastic';

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
    const found = this.identifierToMocksTuples.find(([identifierObj]) => {
      const subject = normalizeIdentifier(identifier, metadata);
      const toFind = normalizeIdentifier(identifierObj.identifier, identifierObj.metadata);

      return isEqual(toFind, subject);
    });

    return found ? (found[1] as StubbedInstance<TDependency> | ConstantValue) : undefined;
  }

  public list() {
    return this.identifierToMocksTuples;
  }
}
