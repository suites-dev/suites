import 'reflect-metadata';
import { Type } from '@automock/types';
import { UnitReference } from './unit-reference';
import { MockFunction, UnitTestbed, Stubbable, StubbedInstance } from '../types';
import { DependenciesMocker } from './dependencies-mocker';

interface MockOverride<TDep, TClass> {
  /**
   * Takes the current implementation (either complete or partial)
   * of the mocked object.
   *
   * @param mockImplementation
   */
  using: <Impl extends Stubbable<TDep>>(mockImplementation: Impl) => TestBedBuilder<TClass>;
}

export interface TestBedBuilder<TClass> {
  /**
   * Declares dependency that is to be mocked by
   * using a type.
   *
   * @return MockOverride
   * @param type {Type}
   */
  mock<TDependency>(type: Type<TDependency>): MockOverride<TDependency, TClass>;

  /**
   * Declares the dependency that is to be mocked by
   * using a token string.
   *
   * @return MockOverride
   * @param token {String}
   */
  mock<TDependency>(token: string): MockOverride<TDependency, TClass>;

  /**
   * Declares the dependency that is to be mocked.
   *
   * @return MockOverride
   * @param typeOrToken
   */
  mock<TDependency>(typeOrToken: Type<TDependency> | string): MockOverride<TDependency, TClass>;

  /**
   * Compiles the unit and creates new testing unit
   *
   * @return UnitTestBed
   */
  compile(): UnitTestbed<TClass>;
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
            using: (mockImplementation: Stubbable<TDependency>) => {
              dependenciesToOverride.set(
                typeOrToken,
                instance.mockFn(mockImplementation) as StubbedInstance<TDependency>
              );
              return this;
            },
          };
        },
        compile(): UnitTestbed<TClass> {
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
