import { Type } from '@suites/types.common';
import {
  UnitReference,
  UnitMocker,
  SolitaryTestBedBuilder,
  BaseTestBedBuilder,
  UnitTestBed,
} from '../../src';
import {
  ArbitraryClassFive,
  ArbitraryClassFour,
  ArbitraryClassOne,
  ArbitraryClassTwo,
  ClassUnderTest,
  FakeDIAdapter,
} from './assets/integration.assets';

const MockedFromBuilder = Symbol.for('MockedFromBuilder');
const MockedFromMocker = Symbol.for('MockFromMocker');
const symbolIdentifier = Symbol.for('TOKEN_METADATA');

describe('Solitary TestBed Builder Integration Tests', () => {
  let underTest: BaseTestBedBuilder<ClassUnderTest>;
  const loggerMock = { warn: jest.fn() } as Partial<Console>;

  // It's a mark for a function that mocks the mock function, don't be confused by the name
  const mockFunctionMockOfBuilder = jest.fn(() => MockedFromBuilder);
  const mockFunctionMockOfMocker = jest.fn(() => MockedFromMocker);

  beforeAll(() => {
    underTest = new SolitaryTestBedBuilder<ClassUnderTest>(
      Promise.resolve(mockFunctionMockOfBuilder),
      Promise.resolve(FakeDIAdapter),
      new UnitMocker(Promise.resolve(mockFunctionMockOfMocker), Promise.resolve(FakeDIAdapter)),
      ClassUnderTest,
      loggerMock as Console
    );
  });

  describe('creating a testbed builder with some mock overrides', () => {
    let unitTestBed: UnitTestBed<ClassUnderTest>;

    beforeAll(async () => {
      unitTestBed = await underTest
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
        .mock(symbolIdentifier, { key: 'value' })
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
        ['custom symbol-based token', { key: 'value' }, MockedFromBuilder, symbolIdentifier],
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

    it('should log a warning indicating the dependency was not found when mocking missing dependency', async () => {
      await underTest.mock('does-not-exists').using({}).compile();
      expect(loggerMock.warn).toHaveBeenCalledTimes(1);
    });
  });
});
