import { Unit, MockOf, TestingUnitt } from '@automock/unit';
import { Logger, MainTestClass, Queue, TestClassOne, TestClassThree, TestClassTwo } from './spec-assets';
import sinon = require('sinon');

describe('AutoMock e2e Test', () => {
  let testingUnit: TestingUnitt<MainTestClass>;
  let logger: MockOf<Logger>;

  const stub = sinon.stub<TestClassOne>({
    foo: async () => 'asd',
  });

  describe('given a unit testing builder with two overrides', () => {
    beforeAll(() => {
      testingUnit = Unit.create(MainTestClass)
        .mock(TestClassOne)
        .using(stub)
        .mock<Queue>('Queue')
        .using({ publish: true })
        .compile();
    });

    describe('when compiling the builder and turning into testing unit', () => {
      test('then return an actual instance of the injectable class', () => {
        expect(testingUnit).toHaveProperty('unit');
        expect(testingUnit.unit).toBeInstanceOf(MainTestClass);
      });

      test('then return a reference of the the compiled unit', () => {
        expect(testingUnit).toHaveProperty('unitRef');
      });

      test('then successfully resolve the dependencies of the tested classes', () => {
        const { unitRef } = testingUnit;

        expect(unitRef.get(TestClassOne)).toBeDefined();
        expect(unitRef.get(TestClassTwo)).toBeDefined();
        expect(unitRef.get(TestClassThree)).toBeDefined();
      });

      test('then do not return the actual reflected dependencies of the injectable class', () => {
        // Indeed, they all need to be overwritten
        const { unitRef } = testingUnit;

        expect(unitRef.get(TestClassOne)).not.toBeInstanceOf(TestClassOne);
        expect(unitRef.get(TestClassTwo)).not.toBeInstanceOf(TestClassTwo);
        expect(unitRef.get(TestClassThree)).not.toBeInstanceOf(TestClassThree);
      });

      test('then hard-mock the implementation of TestClassOne using the "foo" (partial impl function)', async () => {
        const { unitRef } = testingUnit;
        const testClassOne = unitRef.get<TestClassOne>(TestClassOne);
        const logger = unitRef.get<Logger>('Logger');

        await testingUnit.unit.test();

        expect(logger.log).toHaveBeenCalledWith('123456789');

        // The original 'foo' method in TestClassOne return value should be changed
        // according to the passed flag; here, always return the same value
        // cause we mock the implementation of foo permanently
        await expect(testClassOne.foo(true)).resolves.toBe('foo-from-test');
        await expect(testClassOne.foo(false)).resolves.toBe('foo-from-test');
      });

      test('then all the un-override classes/dependencies should be stubs', () => {
        const { unitRef } = testingUnit;
        const testClassTwo: MockOf<TestClassTwo> = unitRef.get(TestClassTwo);

        expect(testClassTwo.bar).toBeDefined();
        // expect(testClassTwo.bar).toBe('jest.fn()');
      });
    });
  });
});
