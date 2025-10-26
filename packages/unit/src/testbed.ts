import { SuitesDIAdapters, SuitesDoublesAdapters, testBedBuilderFactory } from './testbed-builder';
import type { Type } from '@suites/types.common';
import {
  SociableTestBedBuilder as SociableTestBedBuilderCore,
  SolitaryTestBedBuilder as SolitaryTestBedBuilderCore,
} from '@suites/core.unit';
import type { SociableTestBedBuilder, SolitaryTestBedBuilder } from '@suites/core.unit';

/**
 * The main entry point for creating isolated test environments with Suites.
 *
 * TestBed provides two testing modes:
 * - **Solitary**: Complete isolation with all dependencies mocked
 * - **Sociable**: Selective real implementations with other dependencies mocked
 *
 * TestBed uses a Virtual DI Container to analyze the target class metadata, automatically
 * generate type-safe mocks, and wire everything together without boilerplate.
 *
 * @since 3.0.0
 * @see {@link https://suites.dev/docs/api-reference/testbed TestBed Documentation}
 * @see {@link TestBed.solitary} for isolated testing
 * @see {@link TestBed.sociable} for integration testing
 */
export class TestBed {
  /**
   * Creates a test environment where all dependencies are automatically mocked for complete isolation.
   *
   * In solitary mode, every dependency is replaced with an auto-generated mock, this enables:
   * - Test units in complete isolation
   * - Control all inputs and outputs precisely
   * - Focus on specific behavior and edge cases
   * - Achieve fast, deterministic tests
   *
   * @template TClass The type of the class under test
   * @param targetClass The class constructor to test in isolation
   * @returns A builder for configuring mocks before compilation
   *
   * @remarks
   * Solitary tests follow the London/Mockist TDD style where all collaborators are mocked.
   * This provides maximum control and speed at the cost of not catching integration issues.
   * For testing real interactions between components, use {@link TestBed.sociable}.
   *
   * @example
   * // Pre-configure mocks with .mock()
   * const { unit, unitRef } = await TestBed.solitary(UserService)
   *   .mock(UserRepository)
   *   .impl(stubFn => ({
   *     findById: stubFn().mockResolvedValue(testUser),
   *     save: stubFn().mockResolvedValue(void 0)
   *   }))
   *   .compile();
   *
   * @since 3.0.0
   * @see {@link https://suites.dev/docs/api-reference/testbed-solitary Solitary Testing Guide}
   * @see {@link TestBed.sociable} for integration testing
   */
  public static solitary<TClass = any>(targetClass: Type<TClass>): SolitaryTestBedBuilder<TClass> {
    return testBedBuilderFactory(SuitesDIAdapters, SuitesDoublesAdapters, targetClass).create(
      SolitaryTestBedBuilderCore<TClass>
    );
  }

  /**
   * Creates a test environment that selectively uses real implementations alongside mocks.
   *
   * In sociable mode, you explicitly choose which dependencies run real code
   * while everything else remains mocked. This allows to:
   * - Test interactions between multiple real components
   * - Catch integration bugs while maintaining test speed
   * - Validate business logic flows across boundaries
   * - Keep external I/O dependencies mocked
   *
   * @template TClass The type of the class under test
   * @param targetClass The class constructor to test with selective real dependencies
   * @returns A builder requiring `.expose()` to specify real implementations
   *
   * @example
   * // Cannot retrieve exposed dependencies
   * const { unit, unitRef } = await TestBed.sociable(OrderService)
   *   .expose(PriceCalculator)
   *   .compile();
   *
   * // This will throw - exposed dependencies are not available
   * // const calculator = unitRef.get(PriceCalculator); // ❌ Error
   *
   * @since 3.0.0
   * @see {@link https://suites.dev/docs/api-reference/testbed-sociable Sociable API Reference}
   * @see {@link https://suites.dev/docs/guides/testbed-sociable Sociable Guide}
   */
  public static sociable<TClass = any>(
    targetClass: Type<TClass>
  ): Pick<SociableTestBedBuilder<TClass>, 'expose'> {
    return testBedBuilderFactory(SuitesDIAdapters, SuitesDoublesAdapters, targetClass).create(
      SociableTestBedBuilderCore<TClass>
    );
  }
}
