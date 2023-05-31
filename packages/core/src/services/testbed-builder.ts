import { DeepPartial, Type, MockFunction, StubbedInstance } from '@automock/types';
import { UnitReference } from './unit-reference';
import { DependenciesMocker } from './dependencies-mocker';
import { UnitTestBed } from '../types';

export interface MockOverride<TDep, TClass> {
  /**
   * Specifies the mock implementation to be used for the mocked object.
   * @param mockImplementation - The current implementation (either complete or partial)
   * of the mocked object.
   *
   * @returns A TestBedBuilder instance for chaining further configuration.
   * @template Impl - The type of the mock implementation.
   */
  using<Impl extends DeepPartial<TDep>>(mockImplementation: Impl): TestBedBuilder<TClass>;
}

export interface TestBedBuilder<TClass> {
  /**
   * Declares a dependency to be mocked using its type.
   *
   * @param type - The type of the dependency to be mocked.
   * @returns A MockOverride instance for further configuration.
   * @template TDependency - The type of the dependency.
   */
  mock<TDependency>(type: Type<TDependency>): MockOverride<TDependency, TClass>;

  /**
   * Declares a dependency to be mocked using a token string.
   *
   * @param token - The token string representing the dependency to be mocked.
   * @returns A MockOverride instance for further configuration.
   * @template TDependency - The type of the dependency.
   */
  mock<TDependency>(token: string): MockOverride<TDependency, TClass>;

  /**
   * Declares a dependency to be mocked using either its type or a token string.
   *
   * @param typeOrToken - The type or token string representing the dependency to be mocked.
   * @returns A MockOverride instance for further configuration.
   * @template TDependency - The type of the dependency.
   */
  mock<TDependency>(typeOrToken: Type<TDependency> | string): MockOverride<TDependency, TClass>;

  /**
   * Compiles the unit and creates a new testing unit.
   *
   * @returns A UnitTestBed instance representing the compiled unit.
   */
  compile(): UnitTestBed<TClass>;
}

export class BuilderFactory {
  private constructor(
    public readonly mockFn: MockFunction<unknown>,
    public readonly dependenciesMocker: DependenciesMocker
  ) {}

  public static create<TClass>(
    mockFn: MockFunction<unknown>,
    dependenciesMocker: DependenciesMocker
  ): (targetClass: Type<TClass>) => TestBedBuilder<TClass> {
    return (targetClass: Type<TClass>): TestBedBuilder<TClass> => {
      const instance = new this(mockFn, dependenciesMocker);
      const dependenciesToOverride = new Map<Type | string, StubbedInstance<unknown>>();

      return {
        mock<TDependency>(
          typeOrToken: string | Type<TDependency>
        ): MockOverride<TDependency, TClass> {
          return {
            using: (mockImplementation: DeepPartial<TDependency>) => {
              dependenciesToOverride.set(
                typeOrToken,
                instance.mockFn(mockImplementation) as StubbedInstance<TDependency>
              );
              return this;
            },
          };
        },
        compile(): UnitTestBed<TClass> {
          const allDependenciesMocked =
            instance.dependenciesMocker.mockAllDependencies(targetClass)(dependenciesToOverride);

          const values = Array.from(allDependenciesMocked.values());

          return {
            unit: new targetClass(...values) as TClass,
            unitRef: new UnitReference(allDependenciesMocked),
          };
        },
      };
    };
  }
}
