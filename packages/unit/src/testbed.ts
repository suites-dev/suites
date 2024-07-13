import { SuitesDIAdapters, SuitesDoublesAdapters, testBedBuilderFactory } from './testbed-builder';
import type { Type } from '@suites/types.common';
import {
  SociableTestBedBuilder as SociableTestBedBuilderCore,
  SolitaryTestBedBuilder as SolitaryTestBedBuilderCore,
} from '@suites/core.unit';
import type { SociableTestBedBuilder, SolitaryTestBedBuilder } from '@suites/core.unit';

/**
 * @description
 * Provides a testing framework for unit testing classes in both isolated (solitary) and integrated (sociable)
 * environments. This class facilitates building configurable test environments tailored to specific unit tests.
 *
 * @class TestBed
 * @see https://suites.dev/docs/api-reference
 * @since 3.0.0
 */
export class TestBed {
  /**
   * @description
   * Initializes a solitary test environment builder for a specified class. In a solitary environment,
   * all dependencies are mocked by default, ensuring that tests are isolated to the class under test only.
   * This method is ideal for testing the internal logic of the class without external interactions.
   *
   * @since 3.0.0
   * @template TClass The type of the class to be tested.
   * @param {Type<TClass>} targetClass The class for which the test environment is constructed.
   * @returns {SolitaryTestBedBuilder<TClass>} A builder to configure the solitary test environment.
   * @see https://suites.dev/docs/developer-guide/unit-tests
   *
   * @example
   * import { TestBed } from '@suites/unit';
   * import { MyService } from './my-service';
   *
   * const { unit, unitRef } = await TestBed.solitary(MyService).compile();
   */
  public static solitary<TClass = any>(targetClass: Type<TClass>): SolitaryTestBedBuilder<TClass> {
    return testBedBuilderFactory(SuitesDIAdapters, SuitesDoublesAdapters, targetClass).create(
      SolitaryTestBedBuilderCore<TClass>
    );
  }

  /**
   * @description
   * Initializes a sociable test environment builder for a specified class. In a sociable environment,
   * dependencies can be either real or mocked based on the test requirements, allowing for integrated testing.
   * It's essential to use the `.expose()` method at least once to define which dependencies should be real,
   * as this method sets the stage for more complex interaction testing between the class under test and its dependencies.
   *
   * @since 3.0.0
   * @template TClass The type of the class to be tested.
   * @param {Type<TClass>} targetClass The class for which the test environment is constructed.
   * @returns A builder to configure the sociable test environment with 'expose' as the first step,
   * with the ability to selectively expose dependencies.
   *
   * @example
   * import { TestBed } from '@suites/unit';
   * import { MyService, DependencyOne, DependencyTwo, Logger } from './my-service';
   *
   * const { unit, unitRef } = await TestBed.sociable(MyService)
   *   .expose(DependencyOne)
   *   .expose(DependencyTwo)
   *   .mock(Logger)
   *   .impl({ log: jest.fn().mockReturnValue('overridden') })
   *   .compile();
   *
   * @see https://suites.dev/docs/developer-guide/unit-tests
   * @since 3.0.0
   */
  public static sociable<TClass = any>(
    targetClass: Type<TClass>
  ): Pick<SociableTestBedBuilder<TClass>, 'expose'> {
    return testBedBuilderFactory(SuitesDIAdapters, SuitesDoublesAdapters, targetClass).create(
      SociableTestBedBuilderCore<TClass>
    );
  }
}
