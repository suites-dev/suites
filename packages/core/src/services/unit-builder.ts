import type { MockFunction, StubbedInstance } from '@suites/types.doubles';
import type {
  IdentifierMetadata,
  InjectableIdentifier,
  DependencyInjectionAdapter,
} from '@suites/types.di';
import type { Type, ConstantValue, DeepPartial } from '@suites/types.common';
import { SuitesErrorCode } from '@suites/types.common';
import { UnitReference } from './unit-reference';
import type { UnitMocker } from './unit-mocker';
import type { IdentifierToMock } from './mocks-container';
import { MocksContainer } from './mocks-container';
import { normalizeIdentifier } from '../normalize-identifier.static';

export interface UnitTestBed<TClass> {
  unit: TClass;
  unitRef: UnitReference;
}

export interface MockOverride<TDependency, TClass> {
  using(value: TDependency & ConstantValue): TestBedBuilder<TClass>;
  using(mockImplementation: DeepPartial<TDependency>): TestBedBuilder<TClass>;
}

export interface TestBedBuilder<TClass> {
  mock<TDependency>(type: Type<TDependency>): MockOverride<TDependency, TClass>;
  mock<TDependency>(
    type: Type<TDependency>,
    identifierMetadata: IdentifierMetadata
  ): MockOverride<TDependency, TClass>;
  mock<TDependency>(token: string): MockOverride<TDependency, TClass>;
  mock<TDependency>(
    token: string,
    identifierMetadata: IdentifierMetadata
  ): MockOverride<TDependency, TClass>;
  mock<TDependency>(token: symbol): MockOverride<TDependency, TClass>;
  mock<TDependency>(
    token: symbol,
    identifierMetadata: IdentifierMetadata
  ): MockOverride<TDependency, TClass>;
  mock<TDependency>(
    identifier: Type<TDependency> | string | symbol,
    identifierMetadata?: IdentifierMetadata
  ): MockOverride<TDependency, TClass>;
  compile(): Promise<UnitTestBed<TClass>>;
}

export class TestBedBuilder<TClass> {
  private readonly identifiersToBeMocked: IdentifierToMock[] = [];

  public constructor(
    private readonly mockFn: Promise<MockFunction<unknown>>,
    private readonly diAdapter: Promise<DependencyInjectionAdapter>,
    private readonly unitMocker: UnitMocker,
    private readonly targetClass: Type<TClass>,
    private readonly logger: Console
  ) {}

  public mock<TDependency>(
    identifier: InjectableIdentifier,
    metadata?: IdentifierMetadata
  ): MockOverride<TDependency, TClass> {
    return {
      using: (
        mockImplementationOrValue: DeepPartial<TDependency> | ConstantValue
      ): TestBedBuilder<TClass> => {
        this.identifiersToBeMocked.push([
          normalizeIdentifier(identifier, metadata),
          mockImplementationOrValue as StubbedInstance<TDependency> | ConstantValue,
        ]);

        return this;
      },
    };
  }

  public async compile(): Promise<UnitTestBed<TClass>> {
    const diAdapter = await this.diAdapter;
    const dependencyContainer = diAdapter.inspect(this.targetClass);
    const mockFn = await this.mockFn;

    const identifiersToMocks: IdentifierToMock[] = this.identifiersToBeMocked.map(
      ([identifier, valueToMock]) => {
        const dependency = dependencyContainer.resolve<never>(
          identifier.identifier,
          identifier.metadata as never
        );

        if (!dependency) {
          this.logger.warn(
            dependencyNotFoundMessage(identifier.identifier, identifier.metadata as never)
          );
        }

        if (isConstantValue(valueToMock)) {
          return [identifier, valueToMock as ConstantValue];
        }

        return [identifier, mockFn(valueToMock)];
      }
    );

    const mocksContainer = new MocksContainer(identifiersToMocks);

    const cb = await this.unitMocker.applyMocksToUnit(this.targetClass);

    const { container, instance } = cb(mocksContainer, dependencyContainer);

    return {
      unit: instance as TClass,
      unitRef: new UnitReference(container),
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

function dependencyNotFoundMessage(
  identifier: Type | string | symbol,
  metadata: IdentifierMetadata | undefined
): string {
  const identifierName =
    typeof identifier === 'string' || typeof identifier === 'symbol'
      ? String(identifier)
      : identifier.name;
  const metadataMsg = metadata ? `, with metadata [${JSON.stringify(metadata)}]` : '';
  const details = identifierName + metadataMsg;

  return `Suites warning (${SuitesErrorCode.IDENTIFIER_NOT_FOUND}): The provided dependency identifier '${details}' does not match any
existing dependency in the current testing context. Please review your identifier and
ensure it corresponds to the expected configuration.
For more details, refer to our docs website: https://suites.dev/docs`;
}
