import { Type, MockFunction } from '@automock/types';
import { InjectableIdentifier, ClassInjectablesContainer, WithMetadata } from '@automock/common';
import { MocksContainer } from './mocks-container';
import { IdentifierToMock, MockedUnit } from '../types';

export class UnitMocker {
  public constructor(private readonly mockFunction: MockFunction<unknown>) {}

  public applyMocksToUnit<TClass>(
    targetClass: Type<TClass>
  ): (
    mockContainer: MocksContainer,
    injectablesContainer: ClassInjectablesContainer
  ) => MockedUnit<TClass> {
    const identifiersToMocks: IdentifierToMock[] = [];

    return (
      alreadyMockedContainer: MocksContainer,
      injectablesContainer: ClassInjectablesContainer
    ): MockedUnit<TClass> => {
      const allInjectables = injectablesContainer.list() as WithMetadata<never>[];
      const ctorInjectables = allInjectables.filter(({ type }) => type === 'PARAM');
      const propsInjectables = allInjectables.filter(({ type }) => type === 'PROPERTY');

      for (const { identifier, metadata } of ctorInjectables) {
        const mock = alreadyMockedContainer.resolve(identifier, metadata) || this.mockFunction();
        identifiersToMocks.push([normalizeIdentifier(identifier, metadata), mock]);
      }

      const classCtorParams = identifiersToMocks.map(([, value]) => value);
      const classInstance = new targetClass(...classCtorParams) as Record<string, unknown>;

      for (const { identifier, metadata, property } of propsInjectables) {
        const mock = alreadyMockedContainer.resolve(identifier, metadata) || this.mockFunction();

        identifiersToMocks.push([normalizeIdentifier(identifier, metadata), mock]);
        classInstance[property!.key] = mock;
      }

      return {
        container: new MocksContainer(identifiersToMocks),
        instance: classInstance as TClass,
      };
    };
  }
}

export function normalizeIdentifier(identifier: InjectableIdentifier, metadata?: unknown) {
  if (metadata) {
    return Object.assign({ identifier }, { metadata });
  }

  return { identifier };
}
