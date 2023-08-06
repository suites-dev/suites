import { UnitReference } from '@automock/core';
import { TestBed } from '@automock/jest';
import {
  ClassThatIsNotInjected,
  Foo,
  Logger,
  NestJSTestClass,
  TestClassFour,
  TestClassOne,
  TestClassThree,
  TestClassTwo,
} from './e2e-assets';

describe('Automock Jest / NestJS E2E Test Ctor', () => {
  let unit: NestJSTestClass;
  let unitRef: UnitReference;

  beforeAll(() => {
    const { unitRef: ref, unit: underTest } = TestBed.create<NestJSTestClass>(NestJSTestClass)
      .mock(TestClassOne)
      .using({
        async foo(): Promise<string> {
          return 'foo-from-test';
        },
      })
      .mock<string>('PRIMITIVE_VALUE')
      .using('arbitrary-string')
      .mock('UNDEFINED')
      .using({ method: () => 456 })
      .mock<Logger>('LOGGER')
      .using({ log: () => 'baz-from-test' })
      .compile();

    unitRef = ref;
    unit = underTest;
  });

  describe('when compiling the builder and turning into testing unit', () => {
    test('then the unit should an instance of the class under test', () => {
      expect(unit).toBeInstanceOf(NestJSTestClass);
    });

    test('then successfully resolve the dependencies of the tested classes', () => {
      expect(() => unitRef.get(TestClassOne).foo).toBeDefined();
      expect(() => unitRef.get(TestClassTwo)).toBeDefined();
      expect(() => unitRef.get(Foo)).toBeDefined();
      expect(() => unitRef.get<{ log: () => void }>('LOGGER')).toBeDefined();
      expect(() => unitRef.get(TestClassThree)).toBeDefined();
      expect(() => unitRef.get('UNDEFINED_SECOND')).toBeDefined();
      expect(() => unitRef.get(TestClassFour)).toBeDefined();
    });

    test('then do not return the actual reflected dependencies of the injectable class', () => {
      // Indeed, they all need to be overwritten
      expect(() => unitRef.get(TestClassOne)).not.toBeInstanceOf(TestClassOne);
      expect(() => unitRef.get(TestClassTwo)).not.toBeInstanceOf(TestClassTwo);
    });

    test('then hard-mock the implementation of TestClassOne using the "foo" (partial impl function)', async () => {
      const testClassOne: jest.Mocked<TestClassOne> = unitRef.get(TestClassOne);
      const logger = unitRef.get<Logger>('LOGGER');

      // The original 'foo' method in TestClassOne return value should be changed
      // according to the passed flag; here, always return the same value
      // because we mock the implementation of foo permanently
      await expect(testClassOne.foo(true)).resolves.toBe('foo-from-test');
      await expect(testClassOne.foo(false)).resolves.toBe('foo-from-test');

      expect(logger.log).toBeDefined();
    });

    test('then all the un-override classes/dependencies should be stubs', () => {
      const testClassTwo: jest.Mocked<TestClassTwo> = unitRef.get(TestClassTwo);

      expect(testClassTwo.bar.getMockName).toBeDefined();
      expect(testClassTwo.bar.getMockName()).toBe('jest.fn()');
    });

    test('then mock the undefined reflected values and tokens', () => {
      const testClassFour: jest.Mocked<TestClassFour> = unitRef.get(TestClassFour);
      const undefinedValue: jest.Mocked<{ method: () => number }> = unitRef.get<{
        method: () => number;
      }>('UNDEFINED');

      testClassFour.doSomething.mockReturnValue('mocked');

      expect(testClassFour.doSomething()).toBe('mocked');
      expect(undefinedValue.method()).toBe(456);
    });

    test('then throw an error when trying to resolve not existing dependency', () => {
      expect(() => unitRef.get(ClassThatIsNotInjected)).toThrow();
    });
  });
});
