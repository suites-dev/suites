import isEqual from 'lodash.isequal';
import { ConstantValue, IdentifierMetadata, InjectableIdentifier } from '@automock/common';
import { StubbedInstance } from '@automock/types';
import { normalizeIdentifier } from './unit-mocker';
import { IdentifierToMock } from '../types';

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
      return isEqual(identifierObj, subject);
    });

    return found ? (found[1] as StubbedInstance<TDependency> | ConstantValue) : undefined;
  }

  public list() {
    return this.identifierToMocksTuples;
  }
}
