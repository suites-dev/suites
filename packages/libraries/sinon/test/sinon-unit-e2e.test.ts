import { TestingUnit } from '@automock/core';
import { Spec, MockOf } from '../src';
import { MainTestClass, TestClassOne, TestClassThree, TestClassTwo } from '../../../../test/spec-assets';

describe('Sinon Unit E2E Test', () => {
  let unit: TestingUnit<MainTestClass>;
  let unitBuilder;

  describe('given a unit testing builder with two overrides', () => {
    beforeAll(() => {
      unitBuilder = Spec.createUnit(MainTestClass)
        .mock(TestClassOne)
        .using({ foo: Promise.resolve('foo-from-test') });
    });

    describe('when compiling the builder and turning into testing unit', () => {
      beforeAll(() => (unit = unitBuilder.compile()));

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

      test('then return the actual reflected dependencies of the injectable class', () => {
        const { unitRef } = unit;

        expect(unitRef.get(TestClassOne)).toBeInstanceOf(TestClassOne);
        expect(unitRef.get(TestClassTwo)).toBeInstanceOf(TestClassTwo);
        expect(unitRef.get(TestClassThree)).toBeInstanceOf(TestClassThree);
      });

      test('then hard-mock the implementation of TestClassOne using the "foo" (partial impl function)', async () => {
        const { unitRef } = unit;
        const testClassOne = unitRef.get(TestClassOne);

        // The original 'foo' method in TestClassOne return value should be changed
        // according to the passed flag; here, always return the same value
        // cause we mock the implementation of foo permanently
        await expect(testClassOne.foo(true)).resolves.toBe('foo-from-test');
        await expect(testClassOne.foo(false)).resolves.toBe('foo-from-test');
      });

      test('then all the un-override classes/dependencies should be stubs', () => {
        const { unitRef } = unit;
        const testClassTwo: MockOf<TestClassTwo> = unitRef.get(TestClassTwo);

        expect(testClassTwo.bar).toBeDefined();
      });
    });
  });
});
