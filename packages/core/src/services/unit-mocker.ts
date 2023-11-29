import { Type, MockFunction } from '@automock/types';
import { InjectablesRegistry, WithMetadata } from '@automock/common';
import { IdentifierToMock, MocksContainer } from './mocks-container';
import { normalizeIdentifier } from '../normalize-identifier.static';

export interface MockedUnit<TClass> {
  container: MocksContainer;
  instance: TClass;
}

export class UnitMocker {
  public constructor(private readonly mockFunction: MockFunction<unknown>) {}

  public applyMocksToUnit<TClass>(
    targetClass: Type<TClass>
  ): (
    mockContainer: MocksContainer,
    injectablesContainer: InjectablesRegistry
  ) => MockedUnit<TClass> {
    const identifiersToMocks: IdentifierToMock[] = [];

    return (
      mocksContainer: MocksContainer,
      injectablesContainer: InjectablesRegistry
    ): MockedUnit<TClass> => {
      const allInjectables = injectablesContainer.list() as WithMetadata<never>[];
      const ctorInjectables = allInjectables.filter(({ type }) => type === 'PARAM');
      const propsInjectables = allInjectables.filter(({ type }) => type === 'PROPERTY');

      for (const { identifier, metadata } of ctorInjectables) {
        const mock = mocksContainer.resolve(identifier, metadata) || this.mockFunction();
        identifiersToMocks.push([normalizeIdentifier(identifier, metadata), mock]);
      }

      const classCtorParams = identifiersToMocks.map(([, value]) => value);
      const classInstance = new targetClass(...classCtorParams) as Record<string, unknown>;

      for (const { identifier, metadata, property } of propsInjectables) {
        const mock = mocksContainer.resolve(identifier, metadata) || this.mockFunction();

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
