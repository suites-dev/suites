import { StubbedInstance, Type } from '@automock/types';
import { UnitReference } from './unit-reference';

class ClassType {}
class ClassTypeStubbedInstanceFake {}
class ClassFromTokenFake {}

describe('Unit Reference Unit Spec', () => {
  let underTest: UnitReference;

  beforeAll(() => {
    const dependenciesMapMock = new Map<Type | string, StubbedInstance<unknown>>([
      ['token', ClassFromTokenFake],
      [ClassType, ClassTypeStubbedInstanceFake],
    ]);

    underTest = new UnitReference(dependenciesMapMock);
  });

  test('return the corresponding class in the dependencies map when using a constructable type', () => {
    const reference = underTest.get(ClassType);

    expect(reference).toBe(ClassTypeStubbedInstanceFake);
  });

  test('return the corresponding class in the dependencies map when using a token string', () => {
    expect(underTest.get('token')).toBe(ClassFromTokenFake);
  });

  test('throw an error if the the dependency not found in the map of the dependencies mocks', () => {
    expect(() => underTest.get('not-exist')).toThrowError(
      Error(
        "It's weird; Automock cannot find the given dependency reference, make sure you've provided a valid type or token."
      )
    );
  });
});
