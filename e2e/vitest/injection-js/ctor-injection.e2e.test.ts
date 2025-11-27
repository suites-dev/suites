import 'reflect-metadata';
import type { Mocked, UnitReference } from '@suites/unit';
import { TestBed } from '@suites/unit';
import type { Logger } from './e2e-assets';
import {
  API_URL,
  ClassThatIsNotInjected,
  CONSTANT_VALUE,
  InjectionJsTestClass,
  SymbolToken,
  TestClassFive,
  TestClassFour,
  TestClassOne,
  TestClassTwo,
} from './e2e-assets';

describe('Suites Vitest / injection-js E2E Test Ctor', () => {
  let unit: InjectionJsTestClass;
  let unitRef: UnitReference;

  beforeAll(async () => {
    const { unitRef: ref, unit: underTest } = await TestBed.solitary<InjectionJsTestClass>(
      InjectionJsTestClass
    )
      .mock(TestClassOne)
      .impl((stubFn) => ({
        foo: stubFn().mockResolvedValue('foo-from-test'),
        bar(): string {
          return 'bar';
        },
      }))
      .mock<Logger>('LOGGER')
      .impl((stubFn) => ({ log: stubFn().mockReturnValue('baz-from-test') }))
      .mock<string>(API_URL)
      .final('https://api.example.com')
      .mock<string>(CONSTANT_VALUE)
      .final('arbitrary-string')
      .mock<TestClassFive>(SymbolToken)
      .impl((stubFn) => ({ doSomething: stubFn().mockReturnValue('mocked') }))
      .compile();

    unitRef = ref;
    unit = underTest;
  });

  describe('when compiling the builder and turning into testing unit', () => {
    test('then the unit should an instance of the class under test', () => {
      expect(unit).toBeInstanceOf(InjectionJsTestClass);
    });

    test('then successfully resolve the dependencies of the tested classes', () => {
      expect(() => unitRef.get<Logger>('LOGGER')).toBeDefined();
      expect(() => unitRef.get(TestClassOne)).toBeDefined();
      expect(() => unitRef.get<TestClassFive>(SymbolToken)).toBeDefined();
    });

    test('call the unit instance method', async () => {
      const testClassTwo: Mocked<TestClassTwo> = unitRef.get(TestClassTwo);

      testClassTwo.bar.mockResolvedValue('bar-from-test');

      const result = await unit.test();
      expect(result).toBe('bar-from-test-baz-from-test-bar');
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

      expect(testClassTwo.bar.mock).toBeDefined();
      expect(testClassTwo.bar).toBeTypeOf('function');
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
      expect(() => unitRef.get(CONSTANT_VALUE)).toThrow(/as it is marked as a faked dependency/);
    });
  });
});
