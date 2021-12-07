import { TestingUnit, UnitBuilderr } from '@automock/core';
import { MockOf, Spec } from '../src';
import { Logger, MainTestClass, TestClassOne, TestClassThree, TestClassTwo } from '../../../../test/spec-assets';

describe('Jester E2E Test', () => {
  let unit: TestingUnit<MainTestClass>;
  let unitBuilder: UnitBuilderr<MainTestClass>;

  describe('given a unit testing builder with two overrides', () => {
    beforeAll(() => {
      unitBuilder = Spec.createUnit<MainTestClass>(MainTestClass)
        .mock(TestClassOne)
        .using({
          async foo(): Promise<string> {
            return 'foo-from-test';
          },
        })
        .mock('Logger')
        .using({ asd: () => 123 });
    });

    describe('when compiling the builder and turning into testing unit', () => {
      beforeAll(() => {
        unit = unitBuilder.compile();
      });

      test('then return an actual instance of the injectable class', () => {
        expect(unit).toHaveProperty('unit');
        expect(unit.unit).toBeInstanceOf(MainTestClass);
      });

      test('then return a reference of the the compiled unit', () => {
        expect(unit).toHaveProperty('unitRef');
      });

      test('then successfully resolve the dependencies of the tested classes', () => {
        const { unitRef } = unit;

        expect(unitRef.get(TestClassOne)).toBeDefined();
        expect(unitRef.get(TestClassTwo)).toBeDefined();
        expect(unitRef.get(TestClassThree)).toBeDefined();
      });

      test('then do not return the actual reflected dependencies of the injectable class', () => {
        // Indeed, they all need to be overwritten
        const { unitRef } = unit;

        expect(unitRef.get(TestClassOne)).not.toBeInstanceOf(TestClassOne);
        expect(unitRef.get(TestClassTwo)).not.toBeInstanceOf(TestClassTwo);
        expect(unitRef.get(TestClassThree)).not.toBeInstanceOf(TestClassThree);
      });

      test('then hard-mock the implementation of TestClassOne using the "foo" (partial impl function)', async () => {
        const { unitRef } = unit;
        const testClassOne = unitRef.get(TestClassOne);
        const logger = unitRef.get<Logger>('Logger');

        await unit.unit.test();

        expect(logger.log).toHaveBeenCalledWith('123456789');

        // The original 'foo' method in TestClassOne return value should be changed
        // according to the passed flag; here, always return the same value
        // cause we mock the implementation of foo permanently
        await expect(testClassOne.foo(true)).resolves.toBe('foo-from-test');
        await expect(testClassOne.foo(false)).resolves.toBe('foo-from-test');
      });

      test('then all the un-override classes/dependencies should be stubs', () => {
        const { unitRef } = unit;
        const testClassTwo: MockOf<TestClassTwo> = unitRef.get(TestClassTwo);

        expect(testClassTwo.bar.getMockName).toBeDefined();
        expect(testClassTwo.bar.getMockName()).toBe('jest.fn()');
      });
    });
  });
});
