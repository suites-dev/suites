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
   * Fail-fast is enabled by default in v4.0.0. This method allows disabling it
   * for migration purposes, but this is not recommended as it can lead to false positives.
   *
   * @param config Configuration object - only { enabled: false } is accepted
   * @returns The same builder in expose mode
   * @since 4.0.0
   *
   * @see https://suites.dev/docs/api-reference/fail-fast
   */
  failFast(config: { enabled: false }): SociableTestBedBuilderInExposeMode<TClass>;

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
 * Builder interface in **collaborate mode** (blacklist strategy).
 *
 * You entered this mode by calling `.collaborate()` on the initial builder.
 * In collaborate mode:
 * - All dependencies collaborate (are real) by default
 * - Only excluded dependencies are mocked
 * - Leaf classes (no dependencies) are auto-exposed
 * - Token injections are always auto-mocked (natural boundaries)
 *
 * **Auto-expose behavior:**
 * Any class dependency NOT in the exclude array is automatically made real.
 * This simplifies configuration for large dependency trees.
 *
 * **Available methods:**
 * - `exclude()` - Exclude dependencies from collaboration (they will be mocked)
 * - `mock()` - Configure custom mocks (inherited from TestBedBuilder)
 * - `failFast()` - Configure fail-fast behavior
 * - `compile()` - Finalize and create test bed
 *
 * @template TClass The type of the class under test
 * @since 4.0.0
 * @see https://suites.dev/docs/api-reference/testbed-sociable
 */
export interface SociableTestBedBuilderInCollaborateMode<TClass> extends TestBedBuilder<TClass> {
  /**
   * Exclude dependencies from collaboration (they will be auto-mocked).
   *
   * Use this to exclude expensive, external, or already-tested classes
   * from the collaboration. Excluded classes will be auto-stubbed.
   *
   * **Must provide at least one class to exclude.**
   *
   * @param classes - Array of class types to exclude (minimum 1 required)
   * @returns The same builder in collaborate mode
   * @since 4.0.0
   *
   * @example
   * await TestBed.sociable(UserService)
   *   .collaborate()
   *   .exclude([ExpensiveService, ThirdPartySDK])
   *   .compile();
   *
   * @see https://suites.dev/docs/api-reference/testbed-sociable
   */
  exclude(classes: [Type, ...Type[]]): SociableTestBedBuilderInCollaborateMode<TClass>;

  /**
   * Configure fail-fast behavior for dependency resolution.
   *
   * Fail-fast is enabled by default in v4.0.0. This method allows disabling it
   * for migration purposes. In collaborate mode, fail-fast rarely triggers due to auto-expose.
   *
   * @param config Configuration object - only { enabled: false } is accepted
   * @returns The same builder in collaborate mode
   * @since 4.0.0
   *
   * @see https://suites.dev/docs/api-reference/fail-fast
   */
  failFast(config: { enabled: false }): SociableTestBedBuilderInCollaborateMode<TClass>;

  /**
   * Compiles the test bed with collaborate mode configuration.
   *
   * All non-excluded dependencies will be auto-exposed (made real).
   * Only excluded dependencies will be mocked.
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
 * - **Collaborate mode**: All dependencies real by default (call `.collaborate()`)
 *
 * Once you call `.expose()` or `.collaborate()`, the mode is locked for this test.
 *
 * **v4.0.0 Changes:**
 * - Fail-fast is enabled by default (throws on unconfigured dependencies)
 * - Use `.failFast({ enabled: false })` for gradual migration from v3.x
 * - New `.collaborate()` method for blacklist strategy (replaces `.boundaries()`)
 *
 * **Mode Selection Guide:**
 * - Use **expose mode** when you want fine-grained control (few real dependencies)
 * - Use **collaborate mode** when most dependencies should be real (natural collaboration)
 *
 * **Note:** The `.mock()` method is NOT available at this stage.
 * Call `.expose()` or `.collaborate()` first to access `.mock()` for custom configurations.
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
 * // Collaborate mode - all real except exclusions
 * await TestBed.sociable(UserService)
 *   .collaborate()
 *   .exclude([RecommendationEngine, CacheService])
 *   .compile();
 */
export interface SociableTestBedBuilder<TClass> {
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
   * Enables collaborate mode where all dependencies are real by default.
   * Switches the builder to **collaborate mode** (blacklist strategy).
   *
   * **Collaborate Mode Behavior:**
   * - All dependencies collaborate (are real) by default
   * - Use `.exclude()` to blacklist specific dependencies (they will be mocked)
   * - Token injections are always auto-mocked (natural boundaries)
   * - Use `.mock()` for custom mock implementations
   *
   * **Use this when:**
   * - You want all business logic classes to collaborate naturally
   * - You only need to exclude specific expensive/external dependencies
   * - You want the simplest sociable test configuration
   *
   * @returns Builder in collaborate mode
   * @since 4.0.0
   *
   * @example
   * // All business logic real, only tokens mocked
   * await TestBed.sociable(UserService)
   *   .collaborate()
   *   .compile();
   *
   * @example
   * // Exclude specific expensive services
   * await TestBed.sociable(UserService)
   *   .collaborate()
   *   .exclude([ExpensiveMLService, ThirdPartySDK])
   *   .compile();
   *
   * @see https://suites.dev/docs/api-reference/testbed-sociable
   */
  collaborate(): SociableTestBedBuilderInCollaborateMode<TClass>;

  /**
   * Configure fail-fast behavior for dependency resolution.
   *
   * Fail-fast is enabled by default in v4.0.0. This method allows disabling it
   * for migration purposes, but this is not recommended as it can lead to false positives.
   *
   * @param config Configuration object - only { enabled: false } is accepted
   * @returns The same builder
   * @since 4.0.0
   *
   * @see https://suites.dev/docs/api-reference/fail-fast
   */
  failFast(config: { enabled: false }): SociableTestBedBuilder<TClass>;

  /**
   * Compiles the test bed configuration and creates the unit test environment.
   *
   * Processes all configured mocks, exposed dependencies, and exclusions,
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
 * @internal
 * Internal implementation class for SociableTestBedBuilder.
 *
 * This class is exported for framework usage but should not be used directly by consumers.
 * Use `TestBed.sociable()` factory method which returns the `SociableTestBedBuilder` interface type.
 *
 * The class name is intentionally different from the interface to prevent TypeScript's declaration
 * merging, which would expose the inherited `.mock()` method in the public API.
 *
 * @template TClass The type of the class under test
 * @since 3.0.0
 */
export class SociableTestBedBuilderImpl<TClass> extends TestBedBuilder<TClass> implements SociableTestBedBuilder<TClass> {
  private readonly classesToExpose: Type[] = [];
  private readonly excludedClasses: Type[] = [];
  private mode: 'expose' | 'collaborate' | null = null;
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
   * @throws Error if `.collaborate()` was called before
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
    if (this.mode === 'collaborate') {
      throw new Error(
        'Cannot use .expose() after .collaborate().\n' +
          'These represent opposite testing strategies:\n' +
          '  - .expose(): Start with all mocked, selectively make real (whitelist)\n' +
          '  - .collaborate(): Start with all real, selectively exclude from collaboration (blacklist)\n' +
          'Choose one approach for your test.'
      );
    }

    this.mode = 'expose';
    this.classesToExpose.push(dependency);

    return this as SociableTestBedBuilderInExposeMode<TClass>;
  }

  /**
   * Enables collaborate mode where all dependencies are real by default.
   * Sets the builder to "collaborate mode" where all dependencies collaborate naturally,
   * and you can selectively exclude specific dependencies using `.exclude()`.
   *
   * In collaborate mode:
   * - All class dependencies are real by default
   * - Use `.exclude()` to blacklist specific classes (they will be mocked)
   * - Token injections are always auto-mocked (natural boundaries)
   * - Use `.mock()` for custom mock implementations
   *
   * Note: Token injections (e.g., @Inject('TOKEN')) are automatically mocked regardless of mode.
   *
   * @returns The builder instance in collaborate mode
   * @throws Error if `.expose()` was called before
   * @since 4.0.0
   *
   * @example
   * ```typescript
   * // All business logic real, only tokens mocked
   * TestBed.sociable(UserService)
   *   .collaborate()
   *   .compile();
   * ```
   *
   * @example
   * ```typescript
   * // Exclude specific expensive services
   * TestBed.sociable(UserService)
   *   .collaborate()
   *   .exclude([ComplexTaxEngine, ThirdPartySDK])
   *   .compile();
   * ```
   */
  public collaborate(): SociableTestBedBuilderInCollaborateMode<TClass> {
    if (this.mode === 'expose') {
      throw new Error(
        'Cannot use .collaborate() after .expose().\n' +
          'These represent opposite testing strategies:\n' +
          '  - .expose(): Start with all mocked, selectively make real (whitelist)\n' +
          '  - .collaborate(): Start with all real, selectively exclude from collaboration (blacklist)\n' +
          'Choose one approach for your test.'
      );
    }

    this.mode = 'collaborate';

    return this as SociableTestBedBuilderInCollaborateMode<TClass>;
  }

  /**
   * Exclude dependencies from collaboration (they will be auto-mocked).
   * Can only be called in collaborate mode.
   *
   * Use this to exclude expensive, external, or already-tested classes
   * from the collaboration. Excluded classes will be auto-stubbed.
   *
   * @param classes - Array of class types to exclude (minimum 1 required)
   * @returns The builder instance for method chaining
   * @throws Error if not in collaborate mode
   * @since 4.0.0
   *
   * @example
   * ```typescript
   * TestBed.sociable(UserService)
   *   .collaborate()
   *   .exclude([ExpensiveService, ThirdPartySDK])
   *   .compile();
   * ```
   */
  public exclude(classes: [Type, ...Type[]]): SociableTestBedBuilderInCollaborateMode<TClass> {
    if (this.mode !== 'collaborate') {
      throw new Error(
        'Cannot use .exclude() without calling .collaborate() first.\n' +
          '.exclude() is only available in collaborate mode.\n' +
          'Call .collaborate() before using .exclude().'
      );
    }

    this.excludedClasses.push(...classes);

    return this as SociableTestBedBuilderInCollaborateMode<TClass>;
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
   * @param config Configuration object - only { enabled: false } is accepted
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
   * ```
   */
  public failFast(config: { enabled: false }): this {
    this.logger.warn(
      'Suites Warning: Disabling fail-fast is not recommended.\n' +
        'When fail-fast is disabled, unconfigured dependencies return undefined,\n' +
        'which can cause tests to pass incorrectly (false positives).\n' +
        'Consider explicitly configuring all dependencies instead.\n' +
        'Learn more: https://suites.dev/docs/api-reference/fail-fast'
    );

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
          boundaryClasses: [...this.excludedClasses], // Immutable copy (excludedClasses = boundaries in collaborate mode)
          failFastEnabled: this.failFastEnabled,
          autoExposeEnabled: this.mode === 'collaborate',
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

    // In collaborate mode, include auto-exposed classes
    // These should not be retrievable via unitRef (same as explicitly exposed)
    const allExposedClasses =
      this.mode === 'collaborate'
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

    if (mode === 'collaborate') {
      modeExplanation =
        'In collaborate mode, all dependencies are real by default.\n' +
        'Only excluded dependencies are mocked.';
      suggestions =
        `  - Add ${identifier} to exclusions: .collaborate().exclude([${identifier}, ...])\n` +
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
