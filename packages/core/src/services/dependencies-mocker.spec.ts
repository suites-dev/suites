import { DependenciesReflector } from '@automock/common';
import { DependenciesMocker, MockedDependencies } from './dependencies-mocker';

import MockedFn = jest.MockedFn;
import { StubbedInstance, Type } from '@automock/types';

class SomeClassOne {}

class SomeClassTwo {}
class SomeClassTwoMockedLike {}
class ClassFromToken {}
const MOCKED = '__MOCKED__';

describe('Dependencies Mocker Unit Spec', () => {
  let underTest: DependenciesMocker;
  const mockFunctionStub = () => MOCKED;
  const reflectorMock = {
    reflectDependencies: jest.fn() as MockedFn<DependenciesReflector['reflectDependencies']>,
  };

  beforeAll(() => {
    underTest = new DependenciesMocker(reflectorMock, mockFunctionStub);
  });

  describe('mocking all class dependencies', () => {
    beforeAll(() => {
      reflectorMock.reflectDependencies.mockReturnValue({
        constructor: [
          [SomeClassOne, SomeClassOne],
          [SomeClassTwo, SomeClassTwo],
          [SomeClassTwo, SomeClassTwo],
          ['TOKEN', ClassFromToken],
        ],
      });
    });

    describe('assuming there is only one mocked class in the given dependencies', () => {
      let result: MockedDependencies;

      class ArbitraryClass {}
      const alreadyMockedDependencies = new Map<Type | string, Type>([
        [SomeClassTwo, SomeClassTwoMockedLike],
      ]);

      beforeAll(() => {
        result = underTest.mockAllDependencies(ArbitraryClass)(alreadyMockedDependencies);
      });

      it('should return a map of the mocks of the class dependencies', () => {
        expect(result.mocks).toEqual<MockedDependencies['mocks']>(
          new Map<Type | string, StubbedInstance<unknown>>([
            [SomeClassOne, MOCKED],
            [SomeClassTwo, SomeClassTwoMockedLike],
            ['TOKEN', MOCKED],
          ])
        );
      });

      it('should also return the original reflected dependencies', () => {
        expect(result.origin).toEqual<MockedDependencies['origin']>({
          constructor: [
            [SomeClassOne, SomeClassOne],
            [SomeClassTwo, SomeClassTwo],
            [SomeClassTwo, SomeClassTwo],
            ['TOKEN', ClassFromToken],
          ],
        });
      });
    });
  });
});
