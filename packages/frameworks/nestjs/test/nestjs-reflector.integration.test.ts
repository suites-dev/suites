import { MainTestClass, TestClassOne, TestClassThree, TestClassTwo } from './spec-assets';
import NestJSClassReflector from '../src';

describe('NestJS Class Reflector Integration Test', () => {
  let reflector: NestJSClassReflector;

  describe('given a nestjs class reflector', () => {
    beforeAll(() => {
      reflector = new NestJSClassReflector(Reflect, MainTestClass);
    });

    describe('when a new instance has been instantiated', () => {
      test('then create a map with all the class dependencies', () => {
        const { dependencies } = reflector;

        expect(dependencies.get(TestClassOne)).toBeDefined();
        expect(dependencies.get(TestClassTwo)).toBeDefined();
        expect(dependencies.get(TestClassThree)).toBeDefined();
        expect(dependencies.get('Logger')).toBeDefined();
        expect(dependencies.get('Queue')).toBeDefined();
      });
    });
  });
});
