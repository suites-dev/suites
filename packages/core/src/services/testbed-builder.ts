import { DeepPartial, Type, MockFunction, StubbedInstance } from '@automock/types';
import {
  IdentifierMetadata,
  ConstantValue,
  InjectableIdentifier,
  AutomockDependenciesAdapter,
} from '@automock/common';
import { UnitReference } from './unit-reference';
import { normalizeIdentifier, UnitMocker } from './unit-mocker';
import { MockOverride, TestBedBuilder, UnitTestBed } from '../public-types';
import { MocksContainer } from './mocks-container';
import { IdentifierToMock, InvalidIdentifierError } from '../types';

export class UnitBuilder {
  public static create<TClass>(
    mockFn: MockFunction<unknown>,
    unitMocker: UnitMocker,
    adapter: AutomockDependenciesAdapter
  ): (targetClass: Type<TClass>) => TestBedBuilder<TClass> {
    return (targetClass: Type<TClass>): TestBedBuilder<TClass> => {
      const identifiersToMocks: IdentifierToMock[] = [];
      const dependenciesContainer = adapter.build(targetClass);

      return {
        mock<TDependency>(
          identifier: InjectableIdentifier,
          metadata?: IdentifierMetadata
        ): MockOverride<TDependency, TClass> {
          const dependency = dependenciesContainer.resolve<never>(identifier, metadata);

          if (!dependency) {
            throw mockDependencyNotFoundError(identifier, metadata);
          }

          return {
            using: (mockImplementationOrValue: DeepPartial<TDependency> | ConstantValue) => {
              if (isConstantValue(mockImplementationOrValue)) {
                identifiersToMocks.push([
                  normalizeIdentifier(identifier, metadata),
                  mockImplementationOrValue as ConstantValue,
                ]);

                return this;
              }

              identifiersToMocks.push([
                normalizeIdentifier(identifier, metadata),
                mockFn(mockImplementationOrValue) as StubbedInstance<TDependency>,
              ]);

              return this;
            },
          };
        },
        compile(): UnitTestBed<TClass> {
          const { container, instance } = unitMocker.applyMocksToUnit<TClass>(targetClass)(
            new MocksContainer(identifiersToMocks),
            dependenciesContainer
          );

          return {
            unit: instance,
            unitRef: new UnitReference(container),
          };
        },
      };
    };
  }
}

function isConstantValue(value: unknown): value is ConstantValue {
  return (
    Array.isArray(value) ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'symbol' ||
    value === null
  );
}

function mockDependencyNotFoundError(
  identifier: Type | string | symbol,
  metadata: IdentifierMetadata | undefined
): Error {
  const identifierName =
    typeof identifier === 'string' || typeof identifier === 'symbol'
      ? String(identifier)
      : identifier.name;
  const metadataMsg = metadata ? `, with metadata ${metadata}` : '';
  const details = identifierName + metadataMsg;

  return new InvalidIdentifierError(
    `The dependency associated with the specified token or identifier ('${details}') could not be located within the
    current testing context. This issue pertains to the usage of the TestBedBuilder API.
    Please ensure accurate spelling and correspondence between the provided token or identifier and the corresponding 
    injection configuration. If you are utilizing a custom token, it is essential to confirm its proper registration
    within the DI container.
    
    Refer to the docs for further information: https://autmock.dev/docs`
  );
}
