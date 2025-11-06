import type { MockFunction } from '@suites/types.doubles';
import type { DependencyInjectionAdapter } from '@suites/types.di';
import type { IdentifierToMockOrFinal } from './dependency-container.js';
import { DependencyContainer } from './dependency-container.js';
import type { Type } from '@suites/types.common';
import { DependencyResolver } from './dependency-resolver.js';

export interface MockedUnit<TClass> {
  container: DependencyContainer;
  instance: TClass;
  resolution: {
    notFound: IdentifierToMockOrFinal[];
    mocks: { metadata?: unknown; identifier: Type }[];
    exposes: Type[];
  };
  autoExposedClasses: Type[];
}

/**
 * Options for configuring dependency resolution behavior in sociable tests.
 * @since 4.0.0
 */
export interface ResolverOptions {
  /** The current testing mode: expose (whitelist) or collaborate (blacklist) */
  mode: 'expose' | 'collaborate' | null;
  /** Array of classes to exclude from collaboration (mocked in collaborate mode) */
  boundaryClasses: Type[];
  /** Whether to throw errors for unconfigured dependencies (default: true) */
  failFastEnabled: boolean;
  /** Whether to auto-expose non-excluded dependencies (true in collaborate mode) */
  autoExposeEnabled: boolean;
}

/**
 * Service responsible for constructing unit test instances with their dependencies.
 * Orchestrates dependency resolution, mocking, and instantiation.
 *
 * @since 3.0.0
 */
export class UnitMocker {
  public constructor(
    private readonly mockFunction: Promise<MockFunction>,
    private readonly diAdapter: Promise<DependencyInjectionAdapter>
  ) {}

  /**
   * Constructs a unit test instance with configured dependencies.
   *
   * @param targetClass The class to instantiate for testing
   * @param classesToExpose Array of classes to expose as real instances
   * @param mockContainer Container with pre-configured mocks
   * @param options Configuration for dependency resolution behavior
   * @returns Promise resolving to the constructed unit with its container and resolution info
   * @since 3.0.0
   */
  public async constructUnit<TClass>(
    targetClass: Type<TClass>,
    classesToExpose: Type[],
    mockContainer: DependencyContainer,
    options: ResolverOptions
  ): Promise<MockedUnit<TClass>> {
    const dependencyResolver = new DependencyResolver(
      classesToExpose,
      mockContainer,
      await this.diAdapter,
      await this.mockFunction,
      options
    );

    const instance = dependencyResolver.instantiateClass(targetClass);

    const identifierToDependency = Array.from(dependencyResolver.getResolvedDependencies())
      .map(([identifier, value]) => [identifier, value] as IdentifierToMockOrFinal)
      .filter(([{ identifier }]) => identifier !== targetClass);

    return {
      container: new DependencyContainer(identifierToDependency),
      instance: instance as TClass,
      resolution: dependencyResolver.getResolutionSummary(),
      autoExposedClasses: dependencyResolver.getAutoExposedClasses(),
    };
  }
}
