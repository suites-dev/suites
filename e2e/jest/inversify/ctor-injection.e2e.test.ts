import 'reflect-metadata';
import type { UnitReference, Mocked } from '@suites/unit';
import { TestBed } from '@suites/unit';
import type { Logger, Bar } from './e2e-assets';
import {
  ClassThatIsNotInjected,
  Foo,
  InversifyJSTestClass,
  SymbolToken,
  SymbolTokenSecond,
  TestClassFive,
  TestClassFour,
  TestClassOne,
  TestClassThree,
  TestClassTwo,
} from './e2e-assets';

describe('Suites Jest / InversifyJS E2E Test Ctor', () => {
  let unit: InversifyJSTestClass;
  let unitRef: UnitReference;

  beforeAll(async () => {
    const { unitRef: ref, unit: underTest } = await TestBed.solitary<InversifyJSTestClass>(
      InversifyJSTestClass
    )
      .mock(TestClassOne)
      .impl((stubFn) => ({
        foo: stubFn().mockResolvedValue('foo-from-test'),
        bar(): string {
          return 'bar';
        },
      }))
      .mock<Logger>('LOGGER')
      .final({ log: () => 'baz-from-test' })
      .mock('UNDEFINED')
      .final({ method: () => 456 })
      .mock<Bar>('BarToken', { name: 'someTarget' })
      .final({})
      .mock<string>('CONSTANT_VALUE')
      .final('arbitrary-string')
      .mock<TestClassFive>(SymbolToken)
      .final({ doSomething: () => 'mocked' })
      .compile();

    unitRef = ref;
    unit = underTest;
  });

  describe('when compiling the builder and turning into testing unit', () => {
    test('then the unit should an instance of the class under test', () => {
      expect(unit).toBeInstanceOf(InversifyJSTestClass);
    });

    test('then successfully resolve the dependencies of the tested classes', () => {
      expect(() => unitRef.get<{ log: () => void }>('LOGGER')).toBeDefined();
      expect(() => unitRef.get('UNDEFINED')).toBeDefined();
      expect(() => unitRef.get('UNDEFINED_SECOND')).toBeDefined();
      expect(() => unitRef.get(TestClassFour, { canThrow: true })).toBeDefined();
      expect(() => unitRef.get(TestClassThree)).toBeDefined();
      expect(() => unitRef.get(Foo)).toBeDefined();
      expect(() => unitRef.get(TestClassTwo)).toBeDefined();
      expect(() => unitRef.get('CONSTANT_VALUE')).toBeDefined();
      expect(() => unitRef.get(TestClassOne)).toBeDefined();
      expect(() => unitRef.get(SymbolToken)).toBeDefined();
      expect(() => unitRef.get(SymbolTokenSecond)).toBeDefined();
    });

    test('call the unit instance method', async () => {
      const testClassTwo: Mocked<TestClassTwo> = unitRef.get(TestClassTwo);

      testClassTwo.bar.mockResolvedValue('context');

      const result = await unit.test();
      expect(result).toBe('context-baz-from-test-bar');
    });

    test('then do not return the actual reflected dependencies of the injectable class', () => {
      expect(() => unitRef.get(TestClassOne)).not.toBeInstanceOf(TestClassOne);
      expect(() => unitRef.get(TestClassTwo)).not.toBeInstanceOf(TestClassTwo);
      expect(() => unitRef.get(SymbolToken)).not.toBeInstanceOf(TestClassFive);
    });

    test('then mock the implementation of the dependencies', async () => {
      const testClassOne: Mocked<TestClassOne> = unitRef.get(TestClassOne);

      // The original 'foo' method in TestClassOne return value should be changed
      // according to the passed flag; here, always return the same value
      // because we mock the implementation of foo permanently
      await expect(testClassOne.foo(true)).resolves.toBe('foo-from-test');
      await expect(testClassOne.foo(false)).resolves.toBe('foo-from-test');
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
  });
});
