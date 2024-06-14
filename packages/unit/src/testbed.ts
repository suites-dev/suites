import { createTestbedBuilder, SuitesDIAdapters, SuitesDoublesAdapters } from './testbed-builder';
import type { Type } from '@nestjs/common';
import type { TestBedBuilder } from './types';

/**
 * Creates a new TestBedBuilder instance for the given target class. This builder helps in configuring
 * and compiling the test environment for a class that should be tested in isolation (solitary).
 * It sets up the necessary dependencies and mocks, ensuring that the class under test is the primary
 * focus without an interference from other components.
 *
 * @see https://suites.dev/docs/developer-guide/unit-tests
 * @since 3.0.0
 * @template TClass - The class to be tested.
 * @param {Type<TClass>} targetClass - The class to be tested.
 * @returns {TestBedBuilder<TClass>} - The TestBedBuilder instance configured for solitary testing.
 * @example
 * import { TestBed } from '@suites/unit';
 * import { MyService } from './my-service';
 *
 * const { unit, unitRef } = await TestBed.solitary(MyService).compile();
 * // MyService is now tested in isolation with all its dependencies mocked.
 */
export class TestBed {
  /**
   * A factory interface for creating UnitTestBed instances for testing classes.
   *
   * @see https://suites.dev/docs/api-reference
   * @since 3.0.0
   * @example
   * import { TestBed } from '@suites/unit';
   * import { MyService } from './my-service';
   *
   * const { unit, unitRef } = await TestBed.solitary(MyService).compile();
   */
  public static solitary<TClass = any>(targetClass: Type<TClass>): TestBedBuilder<TClass> {
    return createTestbedBuilder(SuitesDIAdapters, SuitesDoublesAdapters, targetClass);
  }
}
