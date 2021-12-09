import { MockResolver } from './mock-resolver';
import { DependencyKey, MockFn } from '@automock/common';

class One {}
class Two {}
class Three {}

describe('MockResolver Unit Test', () => {
  let mockResolver: MockResolver;

  describe('given a mock resolver with a dependency map of two class and a token', () => {
    let result;

    beforeAll(() => {
      const map = new Map<DependencyKey<unknown>, MockFn<unknown, unknown>>();
      map.set(One, One);
      map.set(Two, Two);
      map.set('Three', Three);

      mockResolver = new MockResolver(map);
    });

    describe('when attempting to retrieve a dependency which is a class defined in the map', () => {
      beforeAll(() => (result = mockResolver.get(One)));

      test('then return the exact value in the map of the given class', () => {
        expect(result).toEqual(One);
      });
    });

    describe('when attempting to retrieve a dependency which is a token defined in the map', () => {
      beforeAll(() => (result = mockResolver.get('Three')));

      test('then return the exact value in the map of the given token', () => {
        expect(result).toEqual(Three);
      });
    });

    describe('when attempting to retrieve a dependency/token which is not in the map', () => {
      let action, action2;

      beforeAll(() => {
        action = () => mockResolver.get('Four');
        action2 = () => mockResolver.get(class Five {});
      });

      test('then return throw an error', () => {
        expect(() => action()).toThrowError();
        expect(() => action2()).toThrowError();
      });
    });
  });
});
