import { Type, MockFunction, StubbedInstance } from '@automock/types';
import { DependenciesReflector, PrimitiveValue, ClassDependenciesMap } from '@automock/common';

export interface MockedDependencies {
  mocks: Map<Type | string, StubbedInstance<unknown>>;
  origin: ClassDependenciesMap;
}

export class DependenciesMocker {
  public constructor(
    private readonly reflector: DependenciesReflector,
    private readonly mockFunction: MockFunction<unknown>
  ) {}

  /**
   * Mocks all dependencies of a target class.
   * @param targetClass - The target class whose dependencies should be mocked.
   * @returns A function that accepts already mocked dependencies and returns
   * the updated map of mocked dependencies.
   */
  public mockAllDependencies<TClass>(
    targetClass: Type<TClass>
  ): (
    alreadyMockedDependencies: Map<Type | string, StubbedInstance<unknown> | PrimitiveValue>
  ) => MockedDependencies {
    return (
      alreadyMockedDependencies: Map<Type | string, StubbedInstance<unknown>>
    ): MockedDependencies => {
      const classDependencies = this.reflector.reflectDependencies(targetClass);
      const classMockedDependencies = new Map<Type | string, StubbedInstance<unknown>>();

      for (const [dependency] of classDependencies.constructor) {
        const alreadyMocked = alreadyMockedDependencies.get(dependency);

        const mockedDependency = alreadyMocked
          ? alreadyMocked
          : (this.mockFunction() as StubbedInstance<TClass>);

        classMockedDependencies.set(dependency, mockedDependency);
      }

      return {
        mocks: classMockedDependencies,
        origin: classDependencies,
      };
    };
  }
}
