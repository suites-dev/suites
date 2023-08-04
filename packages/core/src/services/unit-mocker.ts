import { Type, MockFunction, StubbedInstance } from '@automock/types';
import { DependenciesReflector, PrimitiveValue, UndefinedOrNotFound } from '@automock/common';

export interface MockedInjectables<T> {
  mocks: Map<Type | string, StubbedInstance<unknown>>;
  unit: T;
}

export class UnitMocker {
  public constructor(
    private readonly reflector: DependenciesReflector,
    private readonly mockFunction: MockFunction<unknown>,
    private readonly logger: Console
  ) {}

  /**
   * Mocks all dependencies of a target class.
   * @param targetClass - The target class whose dependencies should be mocked.
   * @returns A function that accepts already mocked dependencies and returns
   * the updated map of mocked dependencies.
   */
  public applyMocksToUnit<TClass>(
    targetClass: Type<TClass>
  ): (
    mockedInjectablesMap: Map<Type | string, StubbedInstance<unknown> | PrimitiveValue>
  ) => MockedInjectables<TClass> {
    return (
      mockedInjectablesMap: Map<Type | string, StubbedInstance<unknown>>
    ): MockedInjectables<TClass> => {
      const { constructor = [], properties = [] } = this.reflector.reflectDependencies(targetClass);
      const classMockedInjectables = new Map<Type | string, StubbedInstance<unknown>>();

      for (const [typeOrToken, injectable] of constructor) {
        if (injectable === UndefinedOrNotFound) {
          this.logger.warn('Undefined or not found injectable.');
        }

        const alreadyMocked = mockedInjectablesMap.get(typeOrToken);
        const mockedDependency = alreadyMocked ? alreadyMocked : this.mockFunction();

        classMockedInjectables.set(typeOrToken, mockedDependency);
      }

      const classInstance = new targetClass(...classMockedInjectables.values()) as Record<
        string,
        unknown
      >;

      properties.forEach((reflectedProperty) => {
        if (reflectedProperty.value === UndefinedOrNotFound) {
          this.logger.warn('Undefined or not found injectable.');
        }

        const alreadyMocked = mockedInjectablesMap.get(reflectedProperty.typeOrToken);
        const mockToSet = alreadyMocked ? alreadyMocked : this.mockFunction();

        classInstance[reflectedProperty.property] = mockToSet;
        classMockedInjectables.set(reflectedProperty.typeOrToken, mockToSet);
      });

      return {
        mocks: classMockedInjectables,
        unit: classInstance as TClass,
      };
    };
  }
}
