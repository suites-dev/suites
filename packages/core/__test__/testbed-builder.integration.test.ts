import { Type } from '@automock/types';
import { TestBedBuilder, UnitBuilder, UnitReference, UnitTestBed } from '../src';
import { UnitMocker } from '../src/services/unit-mocker';
import {
  DependencyFive,
  DependencyFourToken,
  DependencyOne,
  DependencyThree,
  DependencyTwo,
  MainClass,
} from './integration.assets';
import { DependenciesReflector, UndefinedDependency } from '@automock/common';

describe('TestBedBuilder Integration Test', () => {
  let underTest: TestBedBuilder<MainClass>;

  // It's a mark for a function that mocks the mock function, don't be confused by the name
  const mockFunctionMockOfBuilder = jest.fn(() => '__MOCKED_FROM_BUILDER__');
  const mockFunctionMockOfMocker = jest.fn(() => '__MOCKED_FROM_MOCKER__');

  const reflectorMock: DependenciesReflector = {
    reflectDependencies: () => {
      return {
        constructor: [
          [DependencyOne, DependencyOne],
          // Repeat on the same dependency twice, as it can be returned from the reflector (@since 1.2.2)
          [DependencyTwo, DependencyTwo],
          [DependencyTwo, DependencyTwo],
          [DependencyThree, UndefinedDependency],
          // Repeat on the same dependency twice, as it can be returned from the reflector (@since 1.2.2)
          ['DEPENDENCY_FOUR_TOKEN', DependencyFourToken],
          ['DEPENDENCY_FOUR_TOKEN', DependencyFourToken],
          ['STRING_TOKEN', 'ANY STRING'],
          ['TOKEN_WITH_UNDEFINED', UndefinedDependency],
        ],
        properties: [
          {
            property: 'arbitraryFive',
            typeOrToken: DependencyFive,
            value: DependencyFive,
          },
          {
            property: 'arbitraryFive',
            typeOrToken: DependencyTwo,
            value: UndefinedDependency,
          },
          {
            property: 'arbitraryArray',
            typeOrToken: 'INJECTED_ARRAY',
            value: Array,
          },
        ],
      };
    },
  };

  const unitMockerMock = new UnitMocker(reflectorMock, mockFunctionMockOfMocker, {
    warn: () => undefined,
  } as Console);

  beforeAll(() => {
    underTest = UnitBuilder.create<MainClass>(mockFunctionMockOfBuilder, unitMockerMock)(MainClass);
  });

  describe('creating a testbed builder with some mock overrides', () => {
    let unitTestBed: UnitTestBed<MainClass>;

    beforeAll(() => {
      unitTestBed = underTest
        .mock(DependencyOne)
        .using({
          print: () => 'dependency-one-overridden',
        })
        .mock(DependencyTwo)
        .using({
          print: () => 'dependency-two-overridden',
        })
        .mock<DependencyFourToken>('DEPENDENCY_FOUR_TOKEN')
        .using({
          print: () => 'dependency-four-overridden',
        })
        .mock<string>('STRING_TOKEN')
        .using('ARBITRARY_STRING')
        .mock('TOKEN_WITH_UNDEFINED')
        .using('SOME_VALUE')
        .compile();
    });

    test('return an instance of a unit test bed with corresponding properties', () => {
      expect(unitTestBed.unit).toBeDefined();
      expect(unitTestBed.unitRef).toBeDefined();
    });

    test('return an instance of the unit and a unit reference', () => {
      expect(unitTestBed.unit).toBeInstanceOf(MainClass);
      expect(unitTestBed.unitRef).toBeInstanceOf(UnitReference);
    });

    describe('override the dependencies from the builder, and leave the rest for the dependencies mocked', () => {
      it.each([
        [DependencyOne.name, '__MOCKED_FROM_BUILDER__', DependencyOne],
        [DependencyTwo.name, '__MOCKED_FROM_BUILDER__', DependencyTwo],
        [DependencyTwo.name, '__MOCKED_FROM_BUILDER__', DependencyTwo],
        [DependencyThree.name, '__MOCKED_FROM_MOCKER__', DependencyThree],
        ['custom token with function', '__MOCKED_FROM_BUILDER__', 'DEPENDENCY_FOUR_TOKEN'],
        ['custom token with undefined symbol', 'SOME_VALUE', 'TOKEN_WITH_UNDEFINED'],
        ['property custom token with injected array', '__MOCKED_FROM_MOCKER__', 'INJECTED_ARRAY'],
        [DependencyFive.name, '__MOCKED_FROM_MOCKER__', DependencyFive],
        ['custom token with primitive value', 'ARBITRARY_STRING', 'STRING_TOKEN'],
      ])(
        'should return a stubbed instance for %p, mocked from %p',
        (name: string, expectedResult: Type | string, dependency: Type | string) => {
          const stubbedInstance = unitTestBed.unitRef.get(dependency);
          expect(stubbedInstance).toEqual(expectedResult);
        }
      );
    });
  });
});
