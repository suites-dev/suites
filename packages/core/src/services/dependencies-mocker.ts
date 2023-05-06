import { Type } from '@automock/types';
import { MockFunction, DependenciesReflector, StubbedInstance } from '../types';

export class DependenciesMocker {
  public constructor(
    private readonly reflector: DependenciesReflector,
    private readonly mockFunction: MockFunction<unknown>
  ) {}

  public mockAllDependencies<TClass>(
    targetClass: Type<TClass>
  ): (
    alreadyMockedDependencies: Map<Type | string, StubbedInstance<unknown>>
  ) => Map<Type | string, StubbedInstance<unknown>> {
    return (alreadyMockedDependencies: Map<Type | string, StubbedInstance<unknown>>) => {
      const classDependencies = this.reflector.reflectDependencies(targetClass);
      const classMockedDependencies = new Map<Type | string, StubbedInstance<unknown>>();

      for (const [dependency] of classDependencies.entries()) {
        const alreadyMocked = alreadyMockedDependencies.get(dependency);

        const mockedDependency = alreadyMocked
          ? alreadyMocked
          : (this.mockFunction() as StubbedInstance<TClass>);

        classMockedDependencies.set(dependency, mockedDependency);
      }

      return classMockedDependencies;
    };
  }
}
