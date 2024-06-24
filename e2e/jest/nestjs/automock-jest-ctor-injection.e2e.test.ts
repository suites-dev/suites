import type { UnitReference, Mocked } from '@suites/unit';
import { TestBed } from '@suites/unit';
import type { Logger, TestClassFive } from './e2e-assets';
import {
  ClassThatIsNotInjected,
  NestJSTestClass,
  SymbolToken,
  TestClassFour,
  TestClassOne,
  TestClassTwo,
} from './e2e-assets';

describe('Suites Jest / NestJS E2E Test Ctor', () => {
  let unit: NestJSTestClass;
  let unitRef: UnitReference;

  beforeAll(async () => {
    const { unitRef: ref, unit: underTest } = await TestBed.solitary<NestJSTestClass>(
      NestJSTestClass
    )
      .mock(TestClassOne)
      .impl((stubFn) => ({
        foo: stubFn().mockResolvedValue('foo-from-test'),
        bar(): string {
          return 'bar';
        },
      }))
      .mock<string>('CONSTANT_VALUE')
      .final('arbitrary-string')
      .mock('UNDEFINED')
      .final({ method: () => 456 })
      .mock<Logger>('LOGGER')
      .impl((stubFn) => ({ log: stubFn().mockReturnValue('baz-from-test') }))
      .mock<TestClassFive>(SymbolToken)
      .final({ doSomething: () => 'mocked' })
      .compile();

    unitRef = ref;
    unit = underTest;
  });

  describe('when compiling the builder and turning into testing unit', () => {
    test('then the unit should an instance of the class under test', () => {
      expect(unit).toBeInstanceOf(NestJSTestClass);
    });

    test('then successfully resolve the dependencies of the tested classes', () => {
      expect(() => unitRef.get<{ log: () => void }>('LOGGER')).toBeDefined();
      expect(() => unitRef.get(TestClassOne)).toBeDefined();
    });

    test('call the unit instance method', async () => {
      const testClassTwo: Mocked<TestClassTwo> = unitRef.get(TestClassTwo);

      testClassTwo.bar.mockResolvedValue('context');

      const result = await unit.test();
      expect(result).toBe('context-baz-from-test-bar');
    });

    test('then mock the implementation of the dependencies', async () => {
      const testClassOne: Mocked<TestClassOne> = unitRef.get(TestClassOne);
      const logger = unitRef.get<Logger>('LOGGER');

      // The original 'foo' method in TestClassOne return value should be changed
      // according to the passed flag; here, always return the same value
      // because we mock the implementation of foo permanently
      await expect(testClassOne.foo(true)).resolves.toBe('foo-from-test');
      await expect(testClassOne.foo(false)).resolves.toBe('foo-from-test');

      expect(logger.log).toBeDefined();
    });

    test('then treat duplicate identifiers as the same reference', async () => {
      await expect(unit.testDuplicateIdentifier()).resolves.toBe('foo-from-test<>foo-from-test');
    });

    test('then all the unoverride classes/dependencies should be stubs as well', () => {
      const testClassTwo: Mocked<TestClassTwo> = unitRef.get(TestClassTwo);

      expect(testClassTwo.bar.getMockName).toBeDefined();
      expect(testClassTwo.bar.getMockName()).toBe('jest.fn()');
    });

    test('then mock the undefined reflected values and tokens', () => {
      const testClassFour: Mocked<TestClassFour> = unitRef.get(TestClassFour);

      testClassFour.doSomething.mockReturnValue('mocked');

      expect(testClassFour.doSomething()).toBe('mocked');
    });

    test('then throw an error when trying to resolve not existing dependency', () => {
      expect(() => unitRef.get(ClassThatIsNotInjected)).toThrow();
    });

    test('then throw an error when trying to resolve faked dependency', () => {
      expect(() => unitRef.get('UNDEFINED')).toThrow(/as it is marked as a faked dependency/);
    });
  });
});
