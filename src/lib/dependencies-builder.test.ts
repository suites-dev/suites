import assert from 'assert';
import { mockDeep } from 'jest-mock-extended';
import { Reflector } from '@nestjs/core';
import { DependenciesBuilder } from './dependencies-builder';
import { MainTestClass, TestClassOne, TestClassTwo } from '../../test/spec-assets';
import { UnitTestingClass } from './types';

describe('DependenciesBuilder Unit Test', () => {
  describe('given a DependenciesBuilder', () => {
    const TESTED_CLASS_DEPENDENCIES = [TestClassOne, TestClassTwo];
    const reflectorMock = ({ get: () => TESTED_CLASS_DEPENDENCIES } as unknown) as Reflector;
    const createMockFn = jest.fn();

    const createBuilder = () =>
      new DependenciesBuilder<MainTestClass>(reflectorMock, createMockFn as typeof mockDeep, MainTestClass);

    describe('scenario: do not specifically mock any of the dependencies', () => {
      let instance: UnitTestingClass<MainTestClass>;

      describe('when not overriding any of the dependencies', () => {
        beforeAll(() => {
          instance = createBuilder().compile();
        });

        // test('then return an instance of the target class', () => {
        //   expect(instance).toBeInstanceOf(MainTestClass);
        // });

        test('then call the mock function exactly by length of the dependencies', () => {
          expect(createMockFn).toHaveBeenCalledTimes(TESTED_CLASS_DEPENDENCIES.length);
        });

        test('then call the mock function with no arguments at all', () => {
          assert(TESTED_CLASS_DEPENDENCIES.length === 2, 'expectation is based of two dependencies');

          expect(createMockFn).toHaveBeenNthCalledWith(1, ...[]);
          expect(createMockFn).toHaveBeenNthCalledWith(2, ...[]);
        });
      });
    });

    describe('scenario: mock some of the dependencies with specific different values', () => {
      describe('when overriding arbitrary dependency in the tested class', () => {
        beforeAll(() => {
          createMockFn.mockClear();

          createBuilder()
            .mock(TestClassTwo)
            .using('value-for-the-test' as any)
            .compile();
        });

        test('then call the mock function exactly by length of the dependencies', () => {
          expect(createMockFn).toHaveBeenCalledTimes(TESTED_CLASS_DEPENDENCIES.length);
        });

        test('then the first call of the mock fn has not been performed with any arguments at all', () => {
          expect(createMockFn).toHaveBeenNthCalledWith(1, ...[]);
        });

        test('then the second call of the mock fn has been performed with the same mock argument', () => {
          expect(createMockFn).toHaveBeenNthCalledWith(2, 'value-for-the-test');
        });
      });
    });
  });
});
