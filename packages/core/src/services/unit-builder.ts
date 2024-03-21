import { MockFunction, StubbedInstance } from '@suites/types.doubles';
import {
  IdentifierMetadata,
  InjectableIdentifier,
  DependencyInjectionAdapter,
} from '@suites/types.di';
import { Type, ConstantValue, DeepPartial, SuitesErrorCode } from '@suites/types.common';
import { UnitReference } from './unit-reference';
import { UnitMocker } from './unit-mocker';
import { IdentifierToMock, MocksContainer } from './mocks-container';
import { normalizeIdentifier } from '../normalize-identifier.static';
import { MockOverride, TestBedBuilder, UnitTestBed } from '../types';

export interface UnitBuilder {
  create<TClass>(
    mockFn: MockFunction<unknown>,
    unitMocker: UnitMocker,
    adapter: DependencyInjectionAdapter,
    logger: Console
  ): (targetClass: Type<TClass>) => TestBedBuilder<TClass>;
}

export class UnitBuilder {
  public static create<TClass>(
    mockFn: MockFunction<unknown>,
    unitMocker: UnitMocker,
    adapter: DependencyInjectionAdapter,
    logger: Console
  ): (targetClass: Type<TClass>) => TestBedBuilder<TClass> {
    return (targetClass: Type<TClass>): TestBedBuilder<TClass> => {
      const identifiersToMocks: IdentifierToMock[] = [];
      const dependencyContainer = adapter.inspect(targetClass);

      return {
        mock<TDependency>(
          identifier: InjectableIdentifier,
          metadata?: IdentifierMetadata
        ): MockOverride<TDependency, TClass> {
          const dependency = dependencyContainer.resolve<never>(identifier, metadata);

          if (!dependency) {
            logger.warn(mockDependencyNotFoundMessage(identifier, metadata));
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
            dependencyContainer
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

function mockDependencyNotFoundMessage(
  identifier: Type | string | symbol,
  metadata: IdentifierMetadata | undefined
): string {
  const identifierName =
    typeof identifier === 'string' || typeof identifier === 'symbol'
      ? String(identifier)
      : identifier.name;
  const metadataMsg = metadata ? `, with metadata [${JSON.stringify(metadata)}]` : '';
  const details = identifierName + metadataMsg;

  return `Automock Warning (${SuitesErrorCode.IDENTIFIER_NOT_FOUND}): The provided dependency identifier '${details}' does not match any
existing dependencies in the current testing context. Please review your identifier and
ensure it corresponds to the expected configuration.
Refer to the docs for further information: https://suites.dev/docs`;
}
