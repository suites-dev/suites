import * as assert from 'assert';
import { TestingUnit } from '@automock/core';
import { SinonSpecBuilder } from './sinon-spec-builder';
import { MainTestClass, TestClassOne, TestClassTwo } from '../../../../test/spec-assets';

describe('Sinon Unit Builder Unit Test', () => {
  describe('given a SinonUnitBuilder', () => {
    const TESTED_CLASS_DEPENDENCIES = [TestClassOne, TestClassTwo];

    const createMockFn = jest.fn().mockImplementation((partial) => partial || 'MOCKED');
    const createBuilder = () => new UnitBuilder<MainTestClass>(MainTestClass, createMockFn);
    const bar = { bar: Promise.resolve('bar') };

    describe('scenario: do not mock the implementation of any of the dependencies', () => {
      let testingUnit: TestingUnit<MainTestClass>;

      describe('when not overriding any of the class dependencies', () => {
        beforeAll(() => {
          testingUnit = createBuilder().compile();
        });

        test('then return an instance of the target class', () => {
          expect(testingUnit.unit).toBeInstanceOf(MainTestClass);
        });

        test('then call the mock function exactly by length of the dependencies', () => {
          expect(createMockFn).toHaveBeenCalledTimes(TESTED_CLASS_DEPENDENCIES.length);
        });

        test('then call the mock function with no arguments at all', () => {
          assert(TESTED_CLASS_DEPENDENCIES.length === 2, 'expectation is based of two dependencies');

          expect(createMockFn).toHaveBeenNthCalledWith(1, TestClassOne);
          expect(createMockFn).toHaveBeenNthCalledWith(2, TestClassTwo);
        });
      });
    });

    describe('scenario: mock some of the dependencies implementation with specific partial mock', () => {
      describe('when overriding arbitrary dependency in the tested class', () => {
        beforeAll(() => {
          createMockFn.mockClear();
          createBuilder().mock(TestClassTwo).using(bar).compile();
        });

        test('then call the mock function exactly by length of the dependencies', () => {
          expect(createMockFn).toHaveBeenCalledTimes(TESTED_CLASS_DEPENDENCIES.length);
        });

        test('then the first call of the mock fn has been invoked with the partial implementation', () => {
          expect(createMockFn).toHaveBeenNthCalledWith(1, TestClassTwo, bar);
        });

        test('then the second call of the mock fn has been invoked with undefined', () => {
          expect(createMockFn).toHaveBeenNthCalledWith(2, TestClassOne);
        });
      });
    });
  });
});
