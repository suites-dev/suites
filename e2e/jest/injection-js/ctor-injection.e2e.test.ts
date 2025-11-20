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
  TestClassWithSelf,
  TestClassWithSkipSelf,
  TestClassWithHost,
  TestClassWithCombinedMetadata,
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
      .final({ log: () => 'baz-from-test' })
      .mock<string>(API_URL)
      .final('https://api.example.com')
      .mock<string>(CONSTANT_VALUE)
      .final('arbitrary-string')
      .mock<TestClassFive>(SymbolToken)
      .final({ doSomething: () => 'mocked' })
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

  describe('when getting a dependency by API_URL token', () => {
    test('then should return the mocked string value', () => {
      const apiUrl: string = unitRef.get(API_URL);
      expect(apiUrl).toBe('https://api.example.com');
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
    test('then should handle undefined optional dependencies', () => {
      const result = unit.testOptional();
      expect(result).toBe('no-optional');
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

describe('Suites Jest / injection-js Metadata Decorators E2E', () => {
  describe('when using @Self() decorator', () => {
    it('should extract and preserve @Self() metadata', async () => {
      const { unit, unitRef } = await TestBed.solitary(TestClassWithSelf).compile();

      expect(unit).toBeInstanceOf(TestClassWithSelf);
      expect(unit.test()).toBe('self-test');

      // Verify dependencies are mocked
      const testClassOne: Mocked<TestClassOne> = unitRef.get(TestClassOne);
      const testClassTwo: Mocked<TestClassTwo> = unitRef.get(TestClassTwo);

      expect(testClassOne).toBeDefined();
      expect(testClassTwo).toBeDefined();
      expect(testClassOne.foo).toBeDefined();
      expect(testClassTwo.bar).toBeDefined();
    });
  });

  describe('when using @SkipSelf() decorator', () => {
    it('should extract and preserve @SkipSelf() metadata', async () => {
      const { unit, unitRef } = await TestBed.solitary(TestClassWithSkipSelf).compile();

      expect(unit).toBeInstanceOf(TestClassWithSkipSelf);
      expect(unit.test()).toBe('skip-self-test');

      // Verify dependencies are mocked
      const testClassThree: Mocked<TestClassThree> = unitRef.get(TestClassThree);
      const testClassFour: Mocked<TestClassFour> = unitRef.get(TestClassFour);

      expect(testClassThree).toBeDefined();
      expect(testClassFour).toBeDefined();
      expect(testClassThree.baz).toBeDefined();
      expect(testClassFour.doSomething).toBeDefined();
    });
  });

  describe('when using @Host() decorator', () => {
    it('should extract and preserve @Host() metadata', async () => {
      const { unit, unitRef } = await TestBed.solitary(TestClassWithHost)
        .mock<Logger>('LOGGER')
        .final({ log: () => 'test-log' })
        .compile();

      expect(unit).toBeInstanceOf(TestClassWithHost);
      expect(unit.test()).toBe('host-test');

      // Verify dependencies are mocked
      const testClassFive: Mocked<TestClassFive> = unitRef.get(TestClassFive);
      const logger: Mocked<Logger> = unitRef.get('LOGGER');

      expect(testClassFive).toBeDefined();
      expect(logger).toBeDefined();
      expect(testClassFive.doSomething).toBeDefined();
      expect(logger.log()).toBe('test-log');
    });
  });

  describe('when combining multiple metadata decorators', () => {
    it('should extract and preserve all combined metadata', async () => {
      const { unit, unitRef } = await TestBed.solitary(TestClassWithCombinedMetadata)
        .mock('SERVICE_A')
        .final({ value: 'service-a' })
        .mock('SERVICE_B')
        .final({ value: 'service-b' })
        .mock<TestClassFive>(SymbolToken)
        .final({ doSomething: () => 'service-c' })
        .mock<string>(API_URL)
        .final('https://api.test.com')
        .compile();

      expect(unit).toBeInstanceOf(TestClassWithCombinedMetadata);
      expect(unit.test()).toBe('combined-metadata-test');

      // Verify all dependencies with different metadata combinations
      const serviceA = unitRef.get('SERVICE_A'); // @Inject + @Optional
      const serviceB = unitRef.get('SERVICE_B'); // @Inject + @Self
      const serviceC: Mocked<TestClassFive> = unitRef.get(SymbolToken); // @Inject + @SkipSelf
      const apiUrl: string = unitRef.get(API_URL); // @Inject + @Host

      expect(serviceA).toEqual({ value: 'service-a' });
      expect(serviceB).toEqual({ value: 'service-b' });
      expect(serviceC.doSomething()).toBe('service-c');
      expect(apiUrl).toBe('https://api.test.com');
    });
  });
});
