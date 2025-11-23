import 'reflect-metadata';
import type { Mocked, UnitReference } from '@suites/unit';
import { TestBed } from '@suites/unit';
import type { Logger } from './e2e-assets';
import {
  API_URL,
  ClassThatIsNotInjected,
  CONSTANT_VALUE,
  Foo,
  InjectionJsTestClass,
  SymbolToken,
  TestClassFive,
  TestClassFour,
  TestClassOne,
  TestClassThree,
  TestClassTwo,
} from './e2e-assets';

describe('Suites Jest / injection-js E2E Test Ctor', () => {
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
  });

  describe('when getting a dependency by a class type identifier', () => {
    test('then should return the corresponding mock object', () => {
      const testClassOne: Mocked<TestClassOne> = unitRef.get(TestClassOne);
      expect(testClassOne.bar()).toBe('bar');
    });
  });

  describe('when getting a dependency by a string token', () => {
    test('then should return the corresponding mock object', () => {
      const logger: Mocked<Logger> = unitRef.get('LOGGER');
      expect(logger.log()).toBe('baz-from-test');
    });
  });

  describe('when getting a dependency by a symbol token', () => {
    test('then should return the corresponding mock object', () => {
      const symbolDep: Mocked<TestClassFive> = unitRef.get(SymbolToken);
      expect(symbolDep.doSomething()).toBe('mocked');
    });
  });


  describe('when resolving duplicate class type identifiers', () => {
    test('then should return the same mock instance for both', async () => {
      const firstInstance: Mocked<TestClassOne> = unitRef.get(TestClassOne);
      const result = await unit.testDuplicateIdentifier();

      expect(result).toBe('foo-from-test<>foo-from-test');
      expect(firstInstance.foo).toHaveBeenCalledTimes(2);
    });
  });

  describe('when using an optional dependency', () => {
    test('then should auto-mock optional dependencies by default', () => {
      const result = unit.testOptional();
      // Optional dependencies are auto-mocked like any other dependency
      // To test the "absent" scenario, use .mock(Bar).final(undefined)
      expect(result).toBe('has-optional');
    });
  });

  describe('when calling a method that uses dependencies', () => {
    test('then should work with all mocked dependencies', async () => {
      const testClassTwo: Mocked<TestClassTwo> = unitRef.get(TestClassTwo);
      testClassTwo.bar.mockResolvedValue('bar-from-test');

      const result = await unit.test();
      expect(result).toBe('bar-from-test-baz-from-test-bar');
    });
  });

  describe('when attempting to get a class that was not injected', () => {
    test('then should throw an identifier not found error', () => {
      expect(() => unitRef.get(ClassThatIsNotInjected)).toThrow();
    });

    test('then throw an error when trying to resolve faked dependency', () => {
      expect(() => unitRef.get(CONSTANT_VALUE)).toThrow(/as it is marked as a faked dependency/);
    });
  });

  describe('when mocking TestClassThree', () => {
    test('then should have the mock available', () => {
      const testClassThree: Mocked<TestClassThree> = unitRef.get(TestClassThree);
      expect(testClassThree).toBeDefined();
      expect(testClassThree.baz).toBeDefined();
    });
  });

  describe('when mocking TestClassFour with @Inject decorator', () => {
    test('then should resolve by the Type identifier', () => {
      const testClassFour: Mocked<TestClassFour> = unitRef.get(TestClassFour);
      expect(testClassFour).toBeDefined();
      expect(testClassFour.doSomething).toBeDefined();
    });
  });

  describe('when mocking Foo repository', () => {
    test('then should resolve by Foo identifier', () => {
      const fooRepo = unitRef.get(Foo);
      expect(fooRepo).toBeDefined();
    });
  });
});
