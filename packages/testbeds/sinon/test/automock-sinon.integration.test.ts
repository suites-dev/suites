import {
  Bar,
  ClassThatIsNotInjected,
  Foo,
  Logger,
  NestJSTestClass,
  TestClassFour,
  TestClassOne,
  TestClassThree,
  TestClassTwo,
} from './spec-assets-nestjs';
import { TestBed } from '../src';
import { TestBedBuilder, UnitTestBed } from '@automock/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SinonStubbedInstance } from 'sinon';

describe('Automock Sinon Broad Integration Test', () => {
  let unitTestBed: UnitTestBed<NestJSTestClass>;
  let testBedBuilder: TestBedBuilder<NestJSTestClass>;

  const testClassOneMock: { foo?: ((flag: boolean) => Promise<string>) | undefined } = {
    async foo(): Promise<string> {
      return 'foo-from-test';
    },
  };

  const loggerMock = { log: () => 'baz-from-test' };

  describe('given a unit testing builder with two overrides', () => {
    jest.spyOn(console, 'warn').mockReturnValue(undefined);

    beforeAll(() => {
      testBedBuilder = TestBed.create<NestJSTestClass>(NestJSTestClass)
        .mock(TestClassOne)
        .using(testClassOneMock)
        .mock<string>('PRIMITIVE_VALUE')
        .using('arbitrary-string')
        .mock('UNDEFINED')
        .using({ method: () => 456 })
        .mock<Logger>('LOGGER')
        .using(loggerMock);
    });

    describe('when compiling the builder and turning into testing unit', () => {
      beforeAll(() => (unitTestBed = testBedBuilder.compile()));

      test('then return an actual instance of the injectable class', () => {
        expect(unitTestBed).toHaveProperty('unit');
        expect(unitTestBed.unit).toBeInstanceOf(NestJSTestClass);
      });

      test('then successfully resolve the dependencies of the tested classes', () => {
        expect(unitTestBed).toHaveProperty('unitRef');

        const { unitRef } = unitTestBed;

        expect(unitRef.get(TestClassOne).foo).toBeDefined();
        expect(unitRef.get(TestClassTwo)).toBeDefined();
        expect(unitRef.get(getRepositoryToken(Foo) as string)).toBeDefined();
        expect(unitRef.get(getRepositoryToken(Bar) as string)).toBeDefined();
        expect(unitRef.get<{ log: () => void }>('LOGGER').log).toBeDefined();
        expect(unitRef.get(TestClassThree)).toBeDefined();
        expect(unitRef.get('PRIMITIVE_VALUE')).toBe('arbitrary-string');
        expect(unitRef.get('UNDEFINED_SECOND')).toBeDefined();
        expect(unitRef.get(TestClassFour)).toBeDefined();
      });

      test('then do not return the actual reflected dependencies of the injectable class', () => {
        // Indeed, they all need to be overwritten
        const { unitRef } = unitTestBed;

        expect(unitRef.get(TestClassOne)).not.toBeInstanceOf(TestClassOne);
        expect(unitRef.get(TestClassTwo)).not.toBeInstanceOf(TestClassTwo);
      });

      test('then throw an error when trying to resolve not existing dependency', () => {
        const { unitRef } = unitTestBed;
        expect(() => unitRef.get(ClassThatIsNotInjected)).toThrow();
      });

      test('then hard-mock the implementation of TestClassOne using the "foo" (partial impl function)', async () => {
        const { unitRef } = unitTestBed;
        const testClassOne = unitRef.get(TestClassOne);
        const logger = unitRef.get<Logger>('LOGGER');

        // The original 'foo' method in TestClassOne return value should be changed
        // according to the passed flag; here, always return the same value
        // because we mock the implementation of foo permanently
        await expect(testClassOne.foo(true)).resolves.toBe('foo-from-test');
        await expect(testClassOne.foo(false)).resolves.toBe('foo-from-test');

        expect(logger.log).toBeDefined();
      });

      test('then all the un-override classes/dependencies should be stubs', async () => {
        const { unitRef } = unitTestBed;
        const testClassTwo: SinonStubbedInstance<TestClassTwo> = unitRef.get(TestClassTwo);

        testClassTwo.bar.resolves('bar-from-test');
        await expect(testClassTwo.bar()).resolves.toBe('bar-from-test');
      });

      test('then mock the undefined reflected values and tokens', () => {
        const { unitRef } = unitTestBed;
        const testClassFour: SinonStubbedInstance<TestClassFour> = unitRef.get(TestClassFour);
        const undefinedValue: SinonStubbedInstance<{ method: () => number }> = unitRef.get<{
          method: () => number;
        }>('UNDEFINED');

        testClassFour.doSomething.returns('mocked');

        expect(testClassFour.doSomething()).toBe('mocked');
        expect(undefinedValue.method()).toBe(456);
      });
    });
  });
});
