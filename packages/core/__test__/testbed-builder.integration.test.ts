import { Type } from '@automock/types';
import { TestBedBuilder, UnitReference, UnitTestBed } from '../src';
import {
  AutomockDependenciesAdapter,
  ClassInjectable,
  UndefinedDependency,
  WithMetadata,
} from '@automock/common';
import { UnitBuilder } from '../src/services/testbed-builder';
import { UnitMocker } from '../src/services/unit-mocker';
import {
  ArbitraryClassFive,
  ArbitraryClassFour,
  ArbitraryClassOne,
  ArbitraryClassSeven,
  ArbitraryClassSix,
  ArbitraryClassThree,
  ArbitraryClassTwo,
  ClassFromToken,
  ClassUnderTest,
} from './assets/integration.assets';

const MockedFromBuilder = Symbol.for('MockedFromBuilder');
const MockedFromMocker = Symbol.for('MockFromMocker');
const symbolIdentifier = Symbol.for('TOKEN_METADATA');

describe('Builder Integration Test', () => {
  let underTest: TestBedBuilder<ClassUnderTest>;
  const resolveStub = jest.fn();

  // It's a mark for a function that mocks the mock function, don't be confused by the name
  const mockFunctionMockOfBuilder = jest.fn(() => MockedFromBuilder);
  const mockFunctionMockOfMocker = jest.fn(() => MockedFromMocker);

  const adapter: AutomockDependenciesAdapter = {
    build: () => {
      return {
        list: () => {
          return [
            { identifier: ArbitraryClassOne, value: ArbitraryClassOne, type: 'PARAM' },
            // We put the same class twice to test that the mocker, it is not a mistake
            { identifier: ArbitraryClassTwo, value: ArbitraryClassTwo, type: 'PARAM' },
            { identifier: ArbitraryClassTwo, value: ArbitraryClassTwo, type: 'PARAM' },
            { identifier: ArbitraryClassFive, value: UndefinedDependency, type: 'PARAM' },
            {
              identifier: 'ArbitraryClassSix',
              metadata: { metadataKey: 'value' },
              value: ArbitraryClassSix,
              type: 'PARAM',
            } as WithMetadata<never>,
            { identifier: 'TOKEN_WITH_UNDEFINED', value: UndefinedDependency, type: 'PARAM' },
            { identifier: 'TOKEN', value: ClassFromToken, type: 'PARAM' },
            {
              type: 'PROPERTY',
              property: { key: 'arbitraryThree' },
              identifier: ArbitraryClassThree,
              value: ArbitraryClassThree,
            },
            {
              type: 'PROPERTY',
              property: { key: 'withMetadata' },
              metadata: { key: 'value' },
              identifier: ArbitraryClassSeven,
              value: ArbitraryClassSeven,
            } as ClassInjectable,
            {
              type: 'PROPERTY',
              property: { key: 'withMetadataSecond' },
              metadata: { anotherKey: 'anotherValue' },
              identifier: symbolIdentifier,
              value: ArbitraryClassSeven,
            } as ClassInjectable,
            {
              type: 'PROPERTY',
              property: { key: 'arbitraryFour' },
              identifier: ArbitraryClassFour,
              value: ArbitraryClassFour,
            },
            {
              type: 'PROPERTY',
              property: { key: 'arbitraryProperty' },
              identifier: 'STRING_TOKEN',
              value: String,
            },
            {
              type: 'PROPERTY',
              property: { key: 'arbitrary' },
              identifier: 'ANOTHER_TOKEN',
              value: String,
            },
          ];
        },
        resolve: resolveStub,
      };
    },
  };

  beforeAll(() => {
    resolveStub.mockReturnValue({});

    underTest = UnitBuilder.create<ClassUnderTest>(
      mockFunctionMockOfBuilder,
      new UnitMocker(mockFunctionMockOfMocker),
      adapter
    )(ClassUnderTest);
  });

  describe('creating a testbed builder with some mock overrides', () => {
    let unitTestBed: UnitTestBed<ClassUnderTest>;

    beforeAll(() => {
      unitTestBed = underTest
        .mock(ArbitraryClassTwo)
        .using({
          print: () => 'overridden',
        })
        .mock(ArbitraryClassFour)
        .using({
          print: () => 'overridden',
        })
        .mock('ANOTHER_TOKEN')
        .using({
          print: () => 'overridden',
        })
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .mock(symbolIdentifier, { metadata: { key: 'value' } })
        .using({
          print: () => 'overridden',
        })
        .mock<string>('STRING_TOKEN')
        .using('ARBITRARY_STRING')
        .mock('TOKEN_WITH_UNDEFINED')
        .using('SOME_VALUE')
        .compile();
    });

    describe('override the dependencies from the builder, and leave the rest for the dependencies mocked', () => {
      it.each([
        [ArbitraryClassOne.name, undefined, MockedFromMocker, ArbitraryClassOne],
        [ArbitraryClassTwo.name, undefined, MockedFromBuilder, ArbitraryClassTwo],
        [ArbitraryClassFive.name, undefined, MockedFromMocker, ArbitraryClassFive],
        [
          'custom string-based token with metadata',
          { metadataKey: 'value' },
          MockedFromMocker,
          'ArbitraryClassSix',
        ],
        [ArbitraryClassFour.name, undefined, MockedFromBuilder, ArbitraryClassFour],
        ['custom string-based token with function', undefined, MockedFromBuilder, 'ANOTHER_TOKEN'],
        ['custom token with undefined value', undefined, 'SOME_VALUE', 'TOKEN_WITH_UNDEFINED'],
        [
          'custom symbol-based token',
          { anotherKey: 'anotherValue' },
          MockedFromMocker,
          symbolIdentifier,
        ],
        [ArbitraryClassFive.name, undefined, MockedFromMocker, ArbitraryClassFive],
        ['custom token with constant value', undefined, 'ARBITRARY_STRING', 'STRING_TOKEN'],
      ])(
        'should return a mock or a value for %p, with metadata %p mocked from %p',
        (
          name: string,
          metadata: undefined | unknown,
          expectedResult: Type | string | symbol,
          dependency: Type | string | symbol
        ) => {
          const stubbedInstance = unitTestBed.unitRef.get(dependency as never, metadata as never);
          expect(stubbedInstance).toEqual(expectedResult);
        }
      );
    });

    it('should return an instance of the unit and a unit reference', () => {
      expect(unitTestBed.unit).toBeInstanceOf(ClassUnderTest);
      expect(unitTestBed.unitRef).toBeInstanceOf(UnitReference);
    });

    it('should throw an error indicating the dependency was not found on mocking missing dependency', () => {
      resolveStub.mockReturnValue(undefined);
      expect(() => underTest.mock('does-not-exists').using({}).compile()).toThrow();
    });
  });
});
