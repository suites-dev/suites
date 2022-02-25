import { MainTestClass, TestClassOne, TestClassThree, TestClassTwo } from './spec-assets';
import { AgnosticClassReflector } from '../src';

describe('Agnostic Class Reflector Integration Test', () => {
  let reflector: AgnosticClassReflector;

  describe('when a new instance has been created', () => {
    beforeAll(() => {
      reflector = new AgnosticClassReflector(Reflect, MainTestClass);
    });

    test('then create a map with all the class dependencies', () => {
      const { dependencies } = reflector;

      expect(dependencies.get(TestClassOne)).toEqual(TestClassOne);
      expect(dependencies.get(TestClassTwo)).toEqual(TestClassTwo);
      expect(dependencies.get(TestClassThree)).toEqual(TestClassThree);
      expect(dependencies.get('Logger')).toBeInstanceOf(Function);
      expect(dependencies.get('Queue')).toBeInstanceOf(Function);
    });
  });
});
