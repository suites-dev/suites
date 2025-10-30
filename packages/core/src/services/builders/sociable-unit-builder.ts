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
 * Builder in expose mode - can only use expose(), not boundaries()
 * @since 4.0.0
 */
export interface SociableTestBedBuilderInExposeMode<TClass> extends TestBedBuilder<TClass> {
  expose(dependency: Type): SociableTestBedBuilderInExposeMode<TClass>;
  disableFailFast(): SociableTestBedBuilderInExposeMode<TClass>;
  compile(): Promise<UnitTestBed<TClass>>;
}

/**
 * Builder in boundaries mode - can only use boundaries(), not expose()
 * @since 4.0.0
 */
export interface SociableTestBedBuilderInBoundariesMode<TClass> extends TestBedBuilder<TClass> {
  disableFailFast(): SociableTestBedBuilderInBoundariesMode<TClass>;
  compile(): Promise<UnitTestBed<TClass>>;
}

/**
 * Initial builder - can choose either expose() or boundaries()
 * @since 4.0.0
 */
export interface SociableTestBedBuilder<TClass> extends TestBedBuilder<TClass> {
  expose(dependency: Type): SociableTestBedBuilderInExposeMode<TClass>;
  boundaries(dependencies: Type[]): SociableTestBedBuilderInBoundariesMode<TClass>;
  disableFailFast(): SociableTestBedBuilder<TClass>;
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
   * Cannot be used after calling `.boundaries()`.
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

  /**
   * Declares dependencies as boundaries (to be mocked) in the test.
   * Sets the builder to "boundaries mode" where all dependencies are real by default
   * and only boundary dependencies are mocked.
   *
   * This is useful when you want most dependencies to be real and only want to isolate
   * specific boundaries like I/O services, external APIs, or expensive operations.
   *
   * Cannot be used after calling `.expose()`.
   *
   * Note: Token injections (e.g., @Inject('TOKEN')) are automatically mocked regardless of mode.
   *
   * @param dependencies Array of class types to treat as boundaries (will be mocked)
   * @returns The builder instance for method chaining
   * @throws Error if `.expose()` was called before
   * @since 4.0.0
   *
   * @example
   * ```typescript
   * // Mock only I/O boundaries, everything else is real
   * TestBed.sociable(UserService)
   *   .boundaries([DatabaseService, HttpClient])
   *   .compile();
   * ```
   */
  public boundaries(dependencies: Type[]): SociableTestBedBuilderInBoundariesMode<TClass> {
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
    this.boundaryClasses.push(...dependencies);

    return this as SociableTestBedBuilderInBoundariesMode<TClass>;
  }

  /**
   * Disables fail-fast behavior for this test.
   * When disabled, accessing unconfigured dependencies returns undefined instead of throwing.
   *
   * WARNING: This is a migration helper for v3.x compatibility and is discouraged.
   * Consider explicitly configuring all dependencies instead.
   * This method will be removed in v5.0.0.
   *
   * @returns The builder instance for method chaining
   * @since 4.0.0
   * @deprecated Will be removed in v5.0.0
   *
   * @example
   * ```typescript
   * // Temporary workaround during migration
   * TestBed.sociable(UserService)
   *   .expose(AuthService)
   *   .disableFailFast() // Not recommended
   *   .compile();
   * ```
   */
  public disableFailFast(): this {
    this.logger.warn(
      'Suites Warning: .disableFailFast() is a migration helper.\n' +
        'Disabling fail-fast means unconfigured dependencies will return undefined,\n' +
        'which can lead to "lying tests" that pass when they should fail.\n' +
        'Consider explicitly configuring all dependencies instead.\n' +
        'This method will be removed in v5.0.0.\n' +
        'Learn more: https://suites.dev/docs/v4-migration'
    );

    this.failFastEnabled = false;

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
      '  - Use .disableFailFast() to restore v3.x behavior (not recommended)\n' +
      '\n' +
      'Learn more: https://suites.dev/docs/v4-migration'
    );
  }
}
