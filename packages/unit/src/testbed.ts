import { SuitesDIAdapters, SuitesDoublesAdapters, testBedBuilderFactory } from './testbed-builder.js';
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
   * @see https://suites.dev/docs/api-reference/testbed-solitary
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
   * dependencies can be configured as either real or mocked based on test requirements.
   *
   * Supports two mutually exclusive testing strategies:
   * - **Expose mode**: Whitelist specific dependencies to be real (default mocks everything)
   * - **Boundaries mode**: Blacklist specific dependencies to be mocked (default makes everything real)
   *
   * v4.0.0: Fail-fast is enabled by default to prevent "lying tests" where unconfigured
   * dependencies return undefined silently. Use `.disableFailFast()` for gradual migration.
   *
   * @since 3.0.0
   * @template TClass The type of the class to be tested.
   * @param {Type<TClass>} targetClass The class for which the test environment is constructed.
   * @returns A builder to configure the sociable test environment
   *
   * @example
   * // Expose mode - whitelist real dependencies
   * const { unit } = await TestBed.sociable(MyService)
   *   .expose(DependencyOne)
   *   .expose(DependencyTwo)
   *   .mock(Logger).impl((stub) => ({ log: stub() }))
   *   .compile();
   *
   * @example
   * // Boundaries mode - mock expensive/flaky class dependencies
   * const { unit } = await TestBed.sociable(MyService)
   *   .boundaries([RecommendationEngine, CacheService])
   *   .compile();
   *
   * @see https://suites.dev/docs/api-reference/testbed-sociable
   */
  public static sociable<TClass = any>(
    targetClass: Type<TClass>
  ): SociableTestBedBuilder<TClass> {
    return testBedBuilderFactory(SuitesDIAdapters, SuitesDoublesAdapters, targetClass).create(
      SociableTestBedBuilderCore<TClass>
    );
  }
}
