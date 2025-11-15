import type { FinalValue, Type } from '@suites/types.common';
import type { MockFunction, StubbedInstance } from '@suites/types.doubles';
import type {
  ClassInjectable,
  DependencyInjectionAdapter,
  IdentifierMetadata,
  InjectableIdentifier,
  WithMetadata,
} from '@suites/types.di';
import type { DependencyContainer, IdentifierToMockOrFinal } from './dependency-container.js';
import { DependencyMap } from './dependency-map.js';
import type { ResolverOptions } from './unit-mocker.js';
import { DependencyNotConfiguredError } from '../errors/dependency-not-configured.error.js';

/**
 * Resolves and instantiates dependencies for unit tests, handling both real and mocked instances.
 * Supports two modes: expose (whitelist real deps) and collaborate (blacklist excluded deps).
 *
 * Resolution priority:
 * 1. Explicit mocks (.mock().impl() or .mock().final())
 * 2. Exclusions (in collaborate mode)
 * 3. Tokens/Primitives (always mocked, except leaf classes in collaborate mode are auto-exposed)
 * 4. Auto-expose (in collaborate mode)
 * 5. Explicit expose (in expose mode)
 * 6. Fail-fast or auto-mock
 *
 * Note: Leaf classes (classes with no dependencies) are auto-exposed in collaborate mode.
 *
 * @since 3.0.0
 */
export class DependencyResolver {
  private readonly dependencyMap = new DependencyMap();
  private readonly availableClassesToExpose = new Set<Type>();
  private readonly autoExposedClasses = new Set<Type>();
  private readonly options: ResolverOptions;

  constructor(
    private readonly classesToExpose: Type[],
    private readonly mockedFromBeforeContainer: DependencyContainer,
    private readonly adapter: DependencyInjectionAdapter,
    private readonly mockFunction: MockFunction,
    options: ResolverOptions
  ) {
    // Store options immutably - never mutate
    this.options = options;
  }

  public isLeafOrPrimitive(identifier: InjectableIdentifier): boolean {
    return (
      typeof identifier !== 'function' ||
      this.adapter.inspect(identifier as Type).list().length === 0
    );
  }

  /**
   * Resolves or mocks a dependency based on configuration and mode.
   * Follows strict resolution priority to ensure predictable behavior.
   *
   * IMPORTANT: This method has NO side effects except for caching in dependencyMap.
   * All decisions are based on immutable configuration.
   *
   * @param identifier The dependency identifier (class, token, or symbol)
   * @param metadata Optional metadata for token-based dependencies
   * @returns The resolved dependency (real instance or mock)
   * @throws Error if fail-fast is enabled and dependency is not configured
   * @since 3.0.0
   */
  public resolveOrMock(
    identifier: InjectableIdentifier,
    metadata?: IdentifierMetadata
  ): Type | FinalValue | StubbedInstance<unknown> {
    // Check cache first (immutable read)
    if (this.dependencyMap.has(identifier)) {
      return this.dependencyMap.get(identifier) as Type | FinalValue | ClassInjectable;
    }

    // Priority 1: Explicit mocks from .mock().impl() or .mock().final()
    const existingMock = this.mockedFromBeforeContainer.resolve(identifier, metadata);
    if (existingMock !== undefined) {
      this.dependencyMap.set(identifier, existingMock, metadata as never);
      return existingMock;
    }

    // Priority 2: Check if it's excluded (in collaborate mode)
    if (
      this.options.mode === 'collaborate' &&
      typeof identifier === 'function' &&
      this.options.excludedClasses.includes(identifier)
    ) {
      const mock = this.mockFunction();
      this.dependencyMap.set(identifier, mock, metadata as never);
      return mock;
    }

    // Priority 3: Tokens and primitives are ALWAYS auto-mocked
    if (this.isLeafOrPrimitive(identifier)) {
      // Special case: exposed leaf classes in expose mode
      if (typeof identifier === 'function' && this.classesToExpose.includes(identifier)) {
        return this.instantiateClass(identifier, metadata);
      }

      // Special case: leaf classes in collaborate mode should be auto-exposed
      if (typeof identifier === 'function' && this.options.autoExposeEnabled) {
        this.autoExposedClasses.add(identifier as Type);
        return this.instantiateClass(identifier as Type, metadata);
      }

      const mock = this.mockFunction();
      this.dependencyMap.set(identifier, mock, metadata as never);
      return mock;
    }

    // Priority 4: Auto-expose in collaborate mode (everything real except exclusions)
    if (this.options.autoExposeEnabled && typeof identifier === 'function') {
      // Track that this class was auto-exposed
      this.autoExposedClasses.add(identifier as Type);
      return this.instantiateClass(identifier as Type, metadata);
    }

    // Priority 5: Explicitly exposed in expose mode
    if (typeof identifier === 'function' && this.classesToExpose.includes(identifier)) {
      return this.instantiateClass(identifier, metadata);
    }

    // Priority 6: Fail-fast or auto-mock
    if (this.options.failFastEnabled) {
      // Extract name safely (immutable operation)
      const name = typeof identifier === 'function' ? identifier.name : String(identifier);

      // Throw error with metadata - message generation happens at higher level
      throw new DependencyNotConfiguredError(
        name,
        this.options.mode,
        this.classesToExpose,
        this.options.excludedClasses
      );
    }

    // Priority 7: Backward compatibility - auto-mock
    if (typeof identifier === 'function') {
      const mock = this.mockFunction();
      this.dependencyMap.set(identifier, mock, metadata as never);
      return mock as StubbedInstance<unknown>;
    }

    // Fallback for non-function identifiers
    const mock = this.mockFunction();
    this.dependencyMap.set(identifier, mock, metadata as never);
    return mock;
  }

  public instantiateClass(
    type: Type,
    metadata: IdentifierMetadata | undefined = undefined
  ): Type | FinalValue | StubbedInstance<unknown> {
    if (this.dependencyMap.has(type)) {
      return this.dependencyMap.get(type) as Type | FinalValue | StubbedInstance<unknown>;
    }

    const injectableRegistry = this.adapter.inspect(type);

    injectableRegistry.list().forEach((injectable: ClassInjectable) => {
      if (typeof injectable.identifier === 'function') {
        this.availableClassesToExpose.add(injectable.identifier);
      }
    });

    const ctorInjectables = injectableRegistry.list().filter(({ type }) => type === 'PARAM');

    const ctorParams = ctorInjectables.map(({ identifier, metadata }: WithMetadata<never>) => {
      if (this.dependencyMap.has(type)) {
        return this.dependencyMap.get(type);
      }

      return this.resolveOrMock(identifier, metadata);
    });

    const instance = new type(...ctorParams);
    this.dependencyMap.set(type, instance, metadata as never);

    const propsInjectables = injectableRegistry.list().filter(({ type }) => type === 'PROPERTY');

    propsInjectables.forEach(({ identifier, metadata, property }: WithMetadata<never>) => {
      const propValue = this.resolveOrMock(identifier, metadata);
      instance[property!.key] = propValue;

      this.dependencyMap.set(type, propValue, metadata as never);
    });

    return instance;
  }

  public getResolvedDependencies() {
    return this.dependencyMap.entries();
  }

  /**
   * Returns information about auto-exposed classes (used in collaborate mode).
   *
   * @returns Array of classes that were auto-exposed
   * @since 4.0.0
   */
  public getAutoExposedClasses(): Type[] {
    return Array.from(this.autoExposedClasses);
  }

  public getResolutionSummary(): {
    mocks: { metadata?: unknown; identifier: Type }[];
    exposes: Type[];
    notFound: IdentifierToMockOrFinal[];
  } {
    const exposes = this.classesToExpose.filter((cls) => !this.availableClassesToExpose.has(cls));

    const mocks = this.mockedFromBeforeContainer
      .list()
      .filter(([injectable]) => typeof injectable.identifier === 'function')
      .filter(([injectable]) => !this.availableClassesToExpose.has(injectable.identifier as Type));

    const notFound = this.mockedFromBeforeContainer.list().filter(([injectable]) => {
      return !this.dependencyMap.has(injectable.identifier);
    });

    return {
      notFound,
      mocks: mocks.map(([injectable]) => injectable) as { metadata?: unknown; identifier: Type }[],
      exposes,
    };
  }
}
