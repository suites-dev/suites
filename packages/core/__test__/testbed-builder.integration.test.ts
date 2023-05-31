import { Type } from '@automock/types';
import { BuilderFactory, TestBedBuilder, UnitReference, UnitTestBed } from '../src';
import { DependenciesMocker } from '../src/services/dependencies-mocker';
import {
  MainClass,
  DependencyFourToken,
  DependencyOne,
  DependencyThree,
  DependencyTwo,
  DependencyFive,
} from './integration.assets';

describe('Builder Factory Integration Test', () => {
  let underTest: TestBedBuilder<MainClass>;

  // It's a function that mocks the mock function, don't be confused by the name
  const mockFunctionMockOfBuilder = jest.fn(() => '__MOCKED_FROM_BUILDER__');
  const mockFunctionMockOfMocker = jest.fn(() => '__MOCKED_FROM_MOCKER__');

  const reflectorMock = {
    reflectDependencies: () => {
      return new Map<Type | string, Type>([
        [DependencyOne, DependencyOne],
        [DependencyTwo, DependencyTwo],
        [DependencyThree, DependencyThree],
        ['DEPENDENCY_FOUR_TOKEN', DependencyFourToken],
        [DependencyFive, DependencyFive],
      ]);
    },
  };

  const dependenciesMockerMock = new DependenciesMocker(reflectorMock, mockFunctionMockOfMocker);

  beforeAll(() => {
    underTest = BuilderFactory.create<MainClass>(
      mockFunctionMockOfBuilder,
      dependenciesMockerMock
    )(MainClass);
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
        [DependencyThree.name, '__MOCKED_FROM_MOCKER__', DependencyThree],
        ['DEPENDENCY_FOUR_TOKEN', '__MOCKED_FROM_BUILDER__', 'DEPENDENCY_FOUR_TOKEN'],
        [DependencyFive.name, '__MOCKED_FROM_MOCKER__', DependencyFive],
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
