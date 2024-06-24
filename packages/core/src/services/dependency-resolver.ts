import type { FinalValue, Type } from '@suites/types.common';
import type { MockFunction, StubbedInstance } from '@suites/types.doubles';
import type {
  ClassInjectable,
  DependencyInjectionAdapter,
  IdentifierMetadata,
  InjectableIdentifier,
  WithMetadata,
} from '@suites/types.di';
import type { DependencyContainer, IdentifierToMockOrFinal } from './dependency-container';
import { DependencyMap } from './dependency-map';

export class DependencyResolver {
  private readonly dependencyMap = new DependencyMap();
  private readonly availableClassesToExpose = new Set<Type>();

  constructor(
    private readonly classesToExpose: Type[],
    private readonly mockedFromBeforeContainer: DependencyContainer,
    private readonly adapter: DependencyInjectionAdapter,
    private readonly mockFunction: MockFunction
  ) {}

  public isLeafOrPrimitive(identifier: InjectableIdentifier): boolean {
    return (
      typeof identifier !== 'function' ||
      this.adapter.inspect(identifier as Type).list().length === 0
    );
  }

  public resolveOrMock(
    identifier: InjectableIdentifier,
    metadata?: IdentifierMetadata
  ): Type | FinalValue | StubbedInstance<unknown> {
    if (this.dependencyMap.has(identifier)) {
      return this.dependencyMap.get(identifier) as Type | FinalValue | ClassInjectable;
    }

    const existingMock = this.mockedFromBeforeContainer.resolve(identifier, metadata);

    if (existingMock !== undefined) {
      this.dependencyMap.set(identifier, existingMock, metadata as never);
      return existingMock;
    }

    if (this.isLeafOrPrimitive(identifier)) {
      if (this.dependencyMap.has(identifier)) {
        return this.dependencyMap.get(identifier) as Type | FinalValue | StubbedInstance<unknown>;
      }

      if (typeof identifier === 'function' && this.classesToExpose.includes(identifier)) {
        this.instantiateClass(identifier, metadata);
      }

      const mock = this.mockFunction();
      this.dependencyMap.set(identifier, mock, metadata as never);
      return mock;
    }

    // Non-leaf classes that are not exposed should also be mocked
    if (typeof identifier === 'function' && !this.classesToExpose.includes(identifier)) {
      const mock = this.mockFunction();
      this.dependencyMap.set(identifier, mock, metadata as never);

      return mock as StubbedInstance<unknown>;
    }

    // Instantiate class if it's not a leaf or primitive
    return this.instantiateClass(identifier as Type, metadata);
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
