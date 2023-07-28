import { DependenciesReflector, PrimitiveValue } from '@automock/common';
import { UnitMocker, MockedInjectables } from './unit-mocker';
import { StubbedInstance, Type } from '@automock/types';

import MockedFn = jest.MockedFn;

class ArbitraryClassOne {}
class ArbitraryClassTwo {}
class ArbitraryClassThree {}
class ArbitraryClassFour {}
class SomeClassTwoMockedLike {}
class ArbitraryClassFourMockedLike {}
class ClassFromToken {}

class DummyClass {
  public arbitraryThree: ArbitraryClassThree;
  public arbitraryFour: ArbitraryClassFour;
  public arbitraryProperty: string;
}

const MOCKED = '__MOCKED__';

describe('Unit Mocker - Unit Spec', () => {
  let underTest: UnitMocker;

  const mockFunctionStub = () => MOCKED;
  const reflectorMock = {
    reflectDependencies: jest.fn() as MockedFn<DependenciesReflector['reflectDependencies']>,
  };

  beforeAll(() => {
    underTest = new UnitMocker(reflectorMock, mockFunctionStub);
  });

  describe('given that the adapter returned both constructor and properties', () => {
    let result: MockedInjectables<DummyClass>;

    const alreadyMockedDependencies = new Map<
      Type | string,
      StubbedInstance<unknown> | PrimitiveValue
    >([
      [ArbitraryClassTwo, SomeClassTwoMockedLike],
      [ArbitraryClassFour, ArbitraryClassFourMockedLike],
    ]);

    beforeAll(() => {
      reflectorMock.reflectDependencies.mockReturnValueOnce({
        constructor: [
          [ArbitraryClassOne, ArbitraryClassOne],
          // We put the same class twice to test that the mocker, it is not a mistake
          [ArbitraryClassTwo, ArbitraryClassTwo],
          [ArbitraryClassTwo, ArbitraryClassTwo],
          ['TOKEN', ClassFromToken],
        ],
        properties: [
          {
            property: 'arbitraryThree',
            typeOrToken: ArbitraryClassThree,
            value: ArbitraryClassThree,
          },
          {
            property: 'arbitraryFour',
            typeOrToken: ArbitraryClassFour,
            value: ArbitraryClassFour,
          },
          {
            property: 'arbitraryProperty',
            typeOrToken: 'ANOTHER_TOKEN',
            value: String,
          },
        ],
      });

      result = underTest.applyMocksToUnit(DummyClass)(alreadyMockedDependencies);
    });

    it('should return a map of the mocks of the class dependencies', () => {
      expect(result.mocks).toEqual<MockedInjectables<DummyClass>['mocks']>(
        new Map<Type | string, StubbedInstance<unknown>>([
          [ArbitraryClassOne, MOCKED],
          [ArbitraryClassThree, MOCKED],
          [ArbitraryClassTwo, SomeClassTwoMockedLike],
          ['ANOTHER_TOKEN', MOCKED],
          ['TOKEN', MOCKED],
          [ArbitraryClassFour, ArbitraryClassFourMockedLike],
        ])
      );
    });

    it('should return the original reflected dependencies as well', () => {
      expect(result.unit).toBeInstanceOf(DummyClass);
      expect(result.unit.arbitraryThree).toBe(MOCKED);
      expect(result.unit.arbitraryFour).toBe(ArbitraryClassFourMockedLike);
      expect(result.unit.arbitraryProperty).toBe(MOCKED);
    });
  });

  describe('given that the adapter returned empty results for both constructor and properties', () => {
    let result: MockedInjectables<DummyClass>;

    beforeAll(() => {
      reflectorMock.reflectDependencies.mockReturnValueOnce({
        constructor: [],
        properties: [],
      });

      result = underTest.applyMocksToUnit(DummyClass)(new Map());
    });

    test('should return', () => {
      expect(result.mocks).toBeInstanceOf(Map);
    });
  });
});
