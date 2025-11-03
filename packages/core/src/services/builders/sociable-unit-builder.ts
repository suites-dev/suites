import type { DoublesAdapter } from '@suites/types.doubles';
import type { Type } from '@suites/types.common';
import { UnitReference } from '../unit-reference.js';
import type { UnitMocker } from '../unit-mocker.js';
import type { IdentifierToMockOrFinal } from '../dependency-container.js';
import { DependencyContainer } from '../dependency-container.js';
import type { UnitTestBed } from '../../types.js';
import { TestBedBuilder } from './testbed-builder.js';
import { DependencyNotConfiguredError } from '../../errors/dependency-not-configured.error.js';

/**
 * Builder interface in **expose mode** (whitelist strategy).
 *
 * You entered this mode by calling `.expose()` on the initial builder.
 * In expose mode:
 * - All dependencies are mocked by default
 * - Only explicitly exposed dependencies are real
 * - Call `.expose()` multiple times to whitelist more dependencies
 *
 * **Available methods:**
 * - `expose()` - Add more real dependencies
 * - `mock()` - Configure custom mocks (inherited from TestBedBuilder)
 * - `failFast()` - Configure fail-fast behavior
 * - `compile()` - Finalize and create test bed
 *
 * @template TClass The type of the class under test
 * @since 4.0.0
 * @see https://suites.dev/docs/api-reference/testbed-sociable
 */
export interface SociableTestBedBuilderInExposeMode<TClass> extends TestBedBuilder<TClass> {
  /**
   * Exposes an additional dependency (makes it real).
   *
   * In expose mode, you can chain multiple `.expose()` calls to whitelist
   * all the dependencies you want to be real instances.
   *
   * @param dependency - The class type to expose as a real instance
   * @returns The same builder in expose mode (stays in expose mode)
   * @since 3.0.0
   *
   * @example
   * await TestBed.sociable(UserService)
   *   .expose(AuthService)
   *   .expose(DatabaseService)
   *   .expose(Logger)
   *   .compile();
   *
   * @see https://suites.dev/docs/api-reference/testbed-sociable
   */
  expose(dependency: Type): SociableTestBedBuilderInExposeMode<TClass>;

  /**
   * Configure fail-fast behavior for dependency resolution.
   *
   * When enabled (default), throws helpful errors for unconfigured dependencies.
   * When disabled, unconfigured dependencies return undefined (v3.x behavior).
   *
   * @param config Configuration object for fail-fast behavior
   * @returns The same builder in expose mode
   * @since 4.0.0
   *
   * @see https://suites.dev/docs/api-reference/fail-fast
   */
  failFast(config: { enabled: boolean }): SociableTestBedBuilderInExposeMode<TClass>;

  /**
   * Compiles the test bed with expose mode configuration.
   *
   * All explicitly exposed dependencies will be real instances.
   * All non-exposed dependencies will be mocked (or throw if fail-fast enabled).
   *
   * @returns Promise resolving to the unit test bed
   * @throws {DependencyNotConfiguredError} If accessing non-exposed dependency with fail-fast
   * @since 3.0.0
   */
  compile(): Promise<UnitTestBed<TClass>>;
}

/**
 * Builder interface in **boundaries mode** (blacklist strategy).
 *
 * You entered this mode by calling `.boundaries()` on the initial builder.
 * In boundaries mode:
 * - All dependencies are real by default (auto-exposed)
 * - Only boundary dependencies are mocked
 * - Leaf classes (no dependencies) are auto-exposed
 * - Token injections are always auto-mocked
 *
 * **Auto-expose behavior:**
 * Any class dependency NOT in the boundaries array is automatically made real.
 * This simplifies configuration for large dependency trees.
 *
 * **Available methods:**
 * - `mock()` - Configure custom mocks (inherited from TestBedBuilder)
 * - `failFast()` - Configure fail-fast behavior
 * - `compile()` - Finalize and create test bed
 *
 * @template TClass The type of the class under test
 * @since 4.0.0
 * @see https://suites.dev/docs/api-reference/testbed-sociable
 */
export interface SociableTestBedBuilderInBoundariesMode<TClass> extends TestBedBuilder<TClass> {
  /**
   * Configure fail-fast behavior for dependency resolution.
   *
   * When enabled (default), throws helpful errors for unconfigured dependencies.
   * In boundaries mode, fail-fast rarely triggers due to auto-expose.
   *
   * @param config Configuration object for fail-fast behavior
   * @returns The same builder in boundaries mode
   * @since 4.0.0
   *
   * @see https://suites.dev/docs/api-reference/fail-fast
   */
  failFast(config: { enabled: boolean }): SociableTestBedBuilderInBoundariesMode<TClass>;

  /**
   * Compiles the test bed with boundaries mode configuration.
   *
   * All non-boundary dependencies will be auto-exposed (made real).
   * Only boundary dependencies will be mocked.
   * Leaf classes are auto-exposed. Tokens are auto-mocked.
   *
   * @returns Promise resolving to the unit test bed
   * @throws Error if dependencies can't be instantiated
   * @since 4.0.0
   */
  compile(): Promise<UnitTestBed<TClass>>;
}

/**
 * Builder interface for configuring sociable unit tests.
 * This is the initial state where you choose your testing strategy.
 *
 * **Two mutually exclusive modes available:**
 * - **Expose mode**: Whitelist real dependencies (call `.expose()`)
 * - **Boundaries mode**: Blacklist mocked dependencies (call `.boundaries()`)
 *
 * Once you call `.expose()` or `.boundaries()`, the mode is locked for this test.
 *
 * **v4.0.0 Changes:**
 * - Fail-fast is enabled by default (throws on unconfigured dependencies)
 * - Use `.failFast({ enabled: false })` for gradual migration from v3.x
 * - New `.boundaries()` method for blacklist strategy
 *
 * **Mode Selection Guide:**
 * - Use **expose mode** when you want fine-grained control (few real dependencies)
 * - Use **boundaries mode** when most dependencies should be real (few boundaries)
 *
 * @template TClass The type of the class under test
 * @since 4.0.0
 * @see https://suites.dev/docs/api-reference/testbed-sociable
 *
 * @example
 * // Expose mode - whitelist real dependencies
 * await TestBed.sociable(UserService)
 *   .expose(AuthService)
 *   .expose(DatabaseService)
 *   .compile();
 *
 * @example
 * // Boundaries mode - blacklist mocked dependencies
 * await TestBed.sociable(UserService)
 *   .boundaries([RecommendationEngine, CacheService])
 *   .compile();
 */
export interface SociableTestBedBuilder<TClass> extends TestBedBuilder<TClass> {
  /**
   * Declares a dependency to be exposed (made real) in the test.
   * Switches the builder to **expose mode** (whitelist strategy).
   *
   * **Expose Mode Behavior:**
   * - All dependencies are mocked by default
   * - Only explicitly exposed dependencies are real
   * - Call `.expose()` multiple times to whitelist dependencies
   *
   * @param dependency - The class type to expose as a real instance
   * @returns Builder in expose mode
   * @since 3.0.0
   *
   * @example
   * await TestBed.sociable(UserService)
   *   .expose(AuthService)
   *   .expose(DatabaseService)
   *   .compile();
   *
   * @see https://suites.dev/docs/api-reference/testbed-sociable
   */
  expose(dependency: Type): SociableTestBedBuilderInExposeMode<TClass>;

  /**
   * Enables boundaries mode with no boundaries (all dependencies are real).
   * Switches the builder to **boundaries mode** where everything is auto-exposed.
   *
   * **Use this when:**
   * - You want all business logic classes to be real
   * - You want the simplest sociable test configuration
   * - Tokens will still be auto-mocked (I/O boundaries)
   *
   * @returns Builder in boundaries mode
   * @since 4.0.0
   *
   * @example
   * // All business logic real, only tokens mocked
   * await TestBed.sociable(UserService)
   *   .boundaries()  // No boundaries - everything real
   *   .compile();
   *
   * @see https://suites.dev/docs/api-reference/testbed-sociable
   */
  boundaries(): SociableTestBedBuilderInBoundariesMode<TClass>;

  /**
   * Declares dependencies as boundaries (to be mocked) in the test.
   * Switches the builder to **boundaries mode** (blacklist strategy).
   *
   * **Boundaries Mode Behavior:**
   * - All dependencies are real by default (auto-exposed)
   * - Only boundary dependencies are mocked
   * - Everything else executes with real business logic
   *
   * **Use boundaries for:**
   * - Classes with complex logic tested elsewhere
   * - Legacy code that's hard to set up
   * - Third-party SDKs you don't control
   * - Non-deterministic classes (random, time-based)
   *
   * **Note:** Token injections (@Inject('TOKEN')) are always auto-mocked.
   * Leaf classes (no dependencies) are auto-exposed in boundaries mode.
   *
   * @param dependencies - Array of class types to treat as boundaries (will be mocked)
   * @returns Builder in boundaries mode
   * @since 4.0.0
   *
   * @example
   * // Avoid specific complex classes
   * await TestBed.sociable(UserService)
   *   .boundaries([ComplexTaxEngine, LegacyAdapter])
   *   .compile();
   *
   * @see https://suites.dev/docs/api-reference/testbed-sociable
   */
  boundaries(dependencies: Type[]): SociableTestBedBuilderInBoundariesMode<TClass>;

  /**
   * Configure fail-fast behavior for dependency resolution.
   *
   * When enabled (default), throws helpful errors for unconfigured dependencies.
   * When disabled, unconfigured dependencies return undefined (v3.x behavior).
   *
   * @param config Configuration object for fail-fast behavior
   * @returns The same builder
   * @since 4.0.0
   *
   * @see https://suites.dev/docs/api-reference/fail-fast
   */
  failFast(config: { enabled: boolean }): SociableTestBedBuilder<TClass>;

  /**
   * Compiles the test bed configuration and creates the unit test environment.
   *
   * Processes all configured mocks, exposed dependencies, and boundaries,
   * then instantiates the unit under test with its dependency graph.
   *
   * **Fail-fast validation (v4.0.0):**
   * - Throws errors for unconfigured dependencies by default
   * - Use `.failFast({ enabled: false })` to restore v3.x behavior (not recommended)
   *
   * @returns Promise resolving to the compiled unit test bed with unit and unitRef
   * @throws {DependencyNotConfiguredError} If fail-fast enabled and dependency not configured
   * @throws Error if configuration conflicts detected
   * @since 3.0.0
   *
   * @see https://suites.dev/docs/api-reference/testbed-sociable
   */
  compile(): Promise<UnitTestBed<TClass>>;
}

/**
 * Builder for creating sociable unit tests with configurable dependency behavior.
 * Supports two mutually exclusive modes:
 * - Expose mode: Explicitly declare which dependencies should be real (default mocks everything)
 * - Boundaries mode: Explicitly declare which dependencies should be mocked (default makes everything real)
 *
 * @template TClass The type of the class under test
 * @since 3.0.0
 */
export class SociableTestBedBuilder<TClass> extends TestBedBuilder<TClass> {
  private readonly classesToExpose: Type[] = [];
  private readonly boundaryClasses: Type[] = [];
  private mode: 'expose' | 'boundaries' | null = null;
  private failFastEnabled: boolean = true;

  public constructor(
    private readonly doublesAdapter: Promise<DoublesAdapter>,
    private readonly unitMocker: UnitMocker,
    private readonly targetClass: Type<TClass>,
    private readonly logger: Console
  ) {
    super();
  }

  /**
   * Declares a dependency to be exposed (made real) in the test.
   * Sets the builder to "expose mode" where dependencies are mocked by default
   * and only explicitly exposed dependencies are real.
   *
   * @param dependency The class type to expose as a real instance
   * @returns The builder instance for method chaining
   * @throws Error if `.boundaries()` was called before
   * @since 3.0.0
   *
   * @example
   * ```typescript
   * TestBed.sociable(UserService)
   *   .expose(AuthService)
   *   .expose(DatabaseService)
   *   .compile();
   * ```
   */
  public expose(dependency: Type): SociableTestBedBuilderInExposeMode<TClass> {
    if (this.mode === 'boundaries') {
      throw new Error(
        'Cannot use .expose() after .boundaries().\n' +
          'These represent opposite testing strategies:\n' +
          '  - .expose(): Start with all mocked, selectively make real (whitelist)\n' +
          '  - .boundaries(): Start with all real, selectively mock boundaries (blacklist)\n' +
          'Choose one approach for your test.'
      );
    }

    this.mode = 'expose';
    this.classesToExpose.push(dependency);

    return this as SociableTestBedBuilderInExposeMode<TClass>;
  }

  public boundaries(): SociableTestBedBuilderInBoundariesMode<TClass>;
  public boundaries(dependencies: Type[]): SociableTestBedBuilderInBoundariesMode<TClass>;
  /**
   * Declares dependencies as boundaries (to be mocked) in the test.
   * Sets the builder to "boundaries mode" where all dependencies are real by default
   * and only boundary dependencies are mocked.
   *
   * List classes you want to avoid testing in this specific test:
   * complex logic tested elsewhere, legacy code, third-party SDKs, non-deterministic classes.
   *
   * Call without arguments to auto-expose all dependencies (no boundaries).
   *
   * Note: Token injections (e.g., @Inject('TOKEN')) are automatically mocked regardless of mode.
   * Token-injected dependencies don't need to be declared as boundaries.
   *
   * @param dependencies Array of class types to treat as boundaries (optional, defaults to empty array)
   * @returns The builder instance for method chaining
   * @throws Error if `.expose()` was called before
   * @since 4.0.0
   *
   * @example
   * ```typescript
   * // Avoid specific complex classes, everything else is real
   * TestBed.sociable(UserService)
   *   .boundaries([ComplexTaxEngine, LegacyAdapter])
   *   .compile();
   * ```
   *
   * @example
   * ```typescript
   * // No boundaries - all business logic is real
   * TestBed.sociable(UserService)
   *   .boundaries()  // No arguments - everything auto-exposed
   *   .compile();
   * ```
   */
  public boundaries(dependencies?: Type[]): SociableTestBedBuilderInBoundariesMode<TClass> {
    if (this.mode === 'expose') {
      throw new Error(
        'Cannot use .boundaries() after .expose().\n' +
          'These represent opposite testing strategies:\n' +
          '  - .expose(): Start with all mocked, selectively make real (whitelist)\n' +
          '  - .boundaries(): Start with all real, selectively mock boundaries (blacklist)\n' +
          'Choose one approach for your test.'
      );
    }

    this.mode = 'boundaries';
    this.boundaryClasses.push(...(dependencies || []));

    return this as SociableTestBedBuilderInBoundariesMode<TClass>;
  }

  /**
   * Configure fail-fast behavior for dependency resolution.
   *
   * Fail-fast is enabled by default in v4.0.0. When enabled, the test bed
   * throws a helpful error if you access a dependency that wasn't configured.
   * This catches configuration mistakes early.
   *
   * You can disable fail-fast for migration from v3.x, but this is discouraged
   * as it can lead to false positives (tests that pass when they should fail).
   *
   * @param config Configuration object for fail-fast behavior
   * @returns The builder instance for method chaining
   * @since 4.0.0
   *
   * @example
   * ```typescript
   * // Disable for migration (not recommended)
   * TestBed.sociable(UserService)
   *   .failFast({ enabled: false })
   *   .expose(AuthService)
   *   .compile();
   *
   * // Explicit enable (default, shown for clarity)
   * TestBed.sociable(UserService)
   *   .failFast({ enabled: true })
   *   .expose(AuthService)
   *   .compile();
   * ```
   */
  public failFast(config: { enabled: boolean }): this {
    if (!config.enabled) {
      this.logger.warn(
        'Suites Warning: Disabling fail-fast is not recommended.\n' +
          'When fail-fast is disabled, unconfigured dependencies return undefined,\n' +
          'which can cause tests to pass incorrectly (false positives).\n' +
          'Consider explicitly configuring all dependencies instead.\n' +
          'Learn more: https://suites.dev/docs/fail-fast'
      );
    }

    this.failFastEnabled = config.enabled;

    return this;
  }

  /**
   * Compiles the test bed configuration and creates the unit test environment.
   * This method processes all configured mocks, exposed dependencies, and boundaries,
   * then instantiates the unit under test with its dependency graph.
   *
   * @returns Promise resolving to the compiled unit test bed
   * @throws Error if configuration conflicts are detected
   * @since 3.0.0
   */
  public async compile(): Promise<UnitTestBed<TClass>> {
    const mockFn = await this.doublesAdapter.then((adapter) => adapter.mock);
    const stubCb = await this.doublesAdapter.then((adapter) => adapter.stub);

    const identifiersToMocks: IdentifierToMockOrFinal[] = this.identifiersToBeMocked.map(
      ([identifier, mockImplCallback]) => {
        return [identifier, mockFn(mockImplCallback(stubCb))];
      }
    );

    const identifiersToFinal: IdentifierToMockOrFinal[] = this.identifiersToBeFinalized.map(
      ([identifier, finalImpl]: IdentifierToMockOrFinal) => {
        return [identifier, finalImpl];
      }
    );

    let container: DependencyContainer;
    let instance: TClass;
    let resolution: {
      notFound: IdentifierToMockOrFinal[];
      mocks: { metadata?: unknown; identifier: Type }[];
      exposes: Type[];
    };
    let autoExposedClasses: Type[];

    try {
      const result = await this.unitMocker.constructUnit<TClass>(
        this.targetClass,
        this.classesToExpose,
        new DependencyContainer([...identifiersToMocks, ...identifiersToFinal]),
        {
          mode: this.mode,
          boundaryClasses: [...this.boundaryClasses], // Immutable copy
          failFastEnabled: this.failFastEnabled,
          autoExposeEnabled: this.mode === 'boundaries',
        }
      );

      container = result.container;
      instance = result.instance;
      resolution = result.resolution;
      autoExposedClasses = result.autoExposedClasses;
    } catch (error) {
      // Handle DependencyNotConfiguredError with user-friendly message
      if (error instanceof DependencyNotConfiguredError) {
        throw new Error(this.formatDependencyNotConfiguredError(error));
      }

      throw error;
    }

    if (resolution.mocks.length > 0) {
      resolution.mocks.forEach((identifier) => {
        this.logger.warn(`Suites Warning: Unreachable Mock Configuration Detected.
You attempted to mock '${identifier.identifier.name}', which is not directly involved in the current testing context of '${this.targetClass.name}'.
This mock will not affect the outcome of your tests because '${identifier.identifier.name}' is neither a direct dependency of the tested unit nor is it
among the dependencies explicitly exposed. If '${identifier.identifier.name}' does not influence the unit under test, consider removing this mock from your
setup to streamline your test configuration. However, if this mock is crucial, verify that all required dependencies are correctly exposed.
For detailed guidance on configuring sociable tests, please consult: https://suites.dev/docs.`);
      });
    }

    if (resolution.exposes.length > 0) {
      resolution.exposes.forEach((identifier) => {
        this.logger.warn(`Suites Warning: Unreachable Exposed Dependency Detected.
The dependency '${identifier.name}' has been exposed but cannot be reached within the current testing context.
This typically occurs because '${identifier.name}' is not a direct dependency of the unit under test (${this.targetClass.name}) nor any
of its other exposed dependencies. Exposing '${identifier.name}' without it being accessible from the unit under test or
its dependencies may lead to incorrect test configurations. To resolve this, please review and adjust your testing
setup to ensure all necessary dependencies are interconnected. Alternatively, if '${identifier.name}' does not influence
the unit under test, consider removing its exposure from your test setup.
For detailed instructions and best practices, refer to our documentation: https://suites.dev/docs.`);
      });
    }

    // In boundaries mode, include auto-exposed classes
    // These should not be retrievable via unitRef (same as explicitly exposed)
    const allExposedClasses =
      this.mode === 'boundaries'
        ? [...this.classesToExpose, ...autoExposedClasses]
        : this.classesToExpose;

    return {
      unit: instance as TClass,
      unitRef: new UnitReference(container, allExposedClasses, this.identifiersToBeFinalized),
    };
  }

  /**
   * Formats a DependencyNotConfiguredError into a user-friendly message.
   * This is the single place responsible for translating error metadata into helpful text.
   *
   * Pure function - no side effects, only string formatting.
   *
   * @param error The error containing metadata about the missing dependency
   * @returns Formatted error message with context and suggestions
   * @since 4.0.0
   */
  private formatDependencyNotConfiguredError(error: DependencyNotConfiguredError): string {
    const { identifier, mode } = error;

    let modeExplanation = '';
    let suggestions = '';

    if (mode === 'boundaries') {
      modeExplanation =
        'In boundaries mode, all dependencies are real by default.\n' +
        'Only dependencies in the boundaries array are mocked.';
      suggestions =
        `  - Add ${identifier} to boundaries: .boundaries([${identifier}, ...])\n` +
        `  - Or use .mock(${identifier}).impl(...) for custom mock behavior`;
    } else if (mode === 'expose') {
      modeExplanation =
        'In expose mode, all dependencies are mocked by default.\n' +
        'Only exposed dependencies are real.';
      suggestions =
        `  - Use .expose(${identifier}) to make it real\n` +
        `  - Or use .mock(${identifier}).impl(...) for custom mock behavior`;
    } else {
      modeExplanation = 'No mode configured - dependencies are mocked by default.';
      suggestions =
        `  - Use .expose(${identifier}) to make it real\n` +
        `  - Or use .mock(${identifier}).impl(...) for custom mock behavior`;
    }

    return (
      `Dependency '${identifier}' was not configured.\n` +
      '\n' +
      `${modeExplanation}\n` +
      '\n' +
      'To fix this:\n' +
      `${suggestions}\n` +
      '  - Use .failFast({ enabled: false }) to restore v3.x behavior (not recommended)\n' +
      '\n' +
      'Learn more: https://suites.dev/docs/v4-migration'
    );
  }
}
