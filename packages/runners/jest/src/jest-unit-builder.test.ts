import assert from 'assert';
import { UnitBuilder } from './jest-unit-builder';
import { TestingUnit } from '@automock/core';
import { MainTestClass, TestClassOne, TestClassTwo } from '../../../../test/spec-assets';

describe('Jest Unit Builder Unit Test', () => {
  describe('given a JestUnitBuilder', () => {
    const TESTED_CLASS_DEPENDENCIES = [TestClassOne, TestClassTwo];

    const reflectorMock = {
      getMetadata: () => TESTED_CLASS_DEPENDENCIES,
    } as unknown as typeof Reflect;

    const createMockFn = jest.fn().mockImplementation((partial) => partial || 'MOCKED');

    const createBuilder = () => new UnitBuilder<MainTestClass>(reflectorMock, MainTestClass, createMockFn);

    const bar = async (): Promise<string> => 'from-test';

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

          expect(createMockFn).toHaveBeenNthCalledWith(1, undefined, { deep: false });
          expect(createMockFn).toHaveBeenNthCalledWith(2, undefined, { deep: false });
        });
      });
    });

    describe('scenario: mock some of the dependencies implementation with specific partial mock', () => {
      describe('when overriding arbitrary dependency in the tested class', () => {
        beforeAll(() => {
          createMockFn.mockClear();
          createBuilder().mock(TestClassTwo).using({ bar }).compile();
        });

        test('then call the mock function exactly by length of the dependencies', () => {
          expect(createMockFn).toHaveBeenCalledTimes(TESTED_CLASS_DEPENDENCIES.length);
        });

        test('then the first call of the mock fn has been invoked with the partial implementation', () => {
          expect(createMockFn).toHaveBeenNthCalledWith(1, { bar });
        });

        test('then the second call of the mock fn has been invoked with undefined', () => {
          expect(createMockFn).toHaveBeenNthCalledWith(2, undefined, { deep: false });
        });
      });
    });

    // describe('scenario: deep mock some of the dependencies implementation with specific partial mock', () => {
    //   describe('when overriding arbitrary dependency in the tested class', () => {
    //     beforeAll(() => {
    //       createMockFn.mockClear();
    //       createBuilder().mockDeep(TestClassTwo).using({ bar }).compile();
    //     });
    //
    //     test('then the first call of the mock fn has been invoked with the partial implementation and deep flag', () => {
    //       expect(createMockFn).toHaveBeenNthCalledWith(1, { bar }, { deep: true });
    //     });
    //
    //     test('then the second call of the mock fn has been invoked with undefined', () => {
    //       expect(createMockFn).toHaveBeenNthCalledWith(2, undefined, { deep: false });
    //     });
    //   });
    // });
    //
    describe('scenario: compile with a flag indicating to deep-mock the unmocked dependencies', () => {
      describe('when overriding arbitrary dependency in the tested class', () => {
        beforeAll(() => {
          createMockFn.mockClear();
          createBuilder().compile(true);
        });

        test('then the first call of the mock fn has been invoked with ', () => {
          expect(createMockFn).toHaveBeenNthCalledWith(1, undefined, { deep: true });
        });

        test('then the second call of the mock fn has been invoked with undefined', () => {
          expect(createMockFn).toHaveBeenNthCalledWith(2, undefined, { deep: true });
        });
      });
    });
  });
});
