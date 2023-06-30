import { DependenciesMocker } from './dependencies-mocker';
import { Type } from '@automock/types';
import { DependenciesReflector } from '@automock/common';
import MockedFn = jest.MockedFn;

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
          ['TOKEN', ClassFromToken],
        ],
      });
    });

    describe('assuming there is only one mocked class in the given dependencies', () => {
      class DoesntMatterClass {}
      const alreadyMockedDependencies = new Map<Type | string, Type>([
        [SomeClassTwo, SomeClassTwoMockedLike],
      ]);

      it('should return a map of class dependencies and mock anything not mocked', () => {
        const result = underTest.mockAllDependencies(DoesntMatterClass)(alreadyMockedDependencies);

        expect(result).toEqual(
          new Map<Type | string, Type | string>([
            [SomeClassOne, MOCKED],
            [SomeClassTwo, SomeClassTwoMockedLike],
            ['TOKEN', MOCKED],
          ])
        );
      });
    });
  });
});
