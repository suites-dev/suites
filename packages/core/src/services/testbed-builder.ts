import { DeepPartial, Type, MockFunction, StubbedInstance } from '@automock/types';
import { UnitReference } from './unit-reference';
import { DependenciesMocker } from './dependencies-mocker';
import { UnitTestBed } from '../types';
import { PrimitiveValue } from '@automock/common';

/**
 * Represents an override configuration for a mocked dependency.
 */
export interface MockOverride<TDep, TClass> {
  /**
   * Specifies the value to be used for the mocked dependency.
   *
   * @param value - The value for the mocked dependency.
   * @returns A `TestBedBuilder` instance for chaining further configuration.
   * @template TValue - The type of the value.
   */
  using<TValue extends PrimitiveValue>(value: TValue): TestBedBuilder<TClass>;

  /**
   * Specifies the mock implementation to be used for the mocked dependency.
   *
   * @param mockImplementation - The mock implementation for the mocked dependency.
   * @returns A `TestBedBuilder` instance for chaining further configuration.
   * @template TImpl - The type of the mock implementation.
   */
  using<TImpl extends DeepPartial<TDep>>(mockImplementation: TImpl): TestBedBuilder<TClass>;

  /**
   * Specifies the mock implementation or value to be used for the mocked dependency.
   *
   * @param mockImplementationOrValue - The mock implementation or value.
   * @returns A `TestBedBuilder` instance for chaining further configuration.
   * @template TImpl - The type of the mock implementation or value.
   */
  using<TImpl extends DeepPartial<TDep> | PrimitiveValue>(
    mockImplementationOrValue: TImpl
  ): TestBedBuilder<TClass>;
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
      const dependenciesToOverride = new Map<
        Type | string,
        PrimitiveValue | StubbedInstance<unknown>
      >();

      return {
        mock<TDependency>(
          typeOrToken: string | Type<TDependency>
        ): MockOverride<TDependency, TClass> {
          return {
            using: (mockImplementationOrValue: DeepPartial<TDependency> | PrimitiveValue) => {
              if (isPrimitive(mockImplementationOrValue)) {
                dependenciesToOverride.set(
                  typeOrToken,
                  mockImplementationOrValue as PrimitiveValue
                );
                return this;
              }

              dependenciesToOverride.set(
                typeOrToken,
                instance.mockFn(mockImplementationOrValue) as StubbedInstance<TDependency>
              );
              return this;
            },
          };
        },
        compile(): UnitTestBed<TClass> {
          const { mocks, origin } =
            instance.dependenciesMocker.mockAllDependencies(targetClass)(dependenciesToOverride);

          const values = origin.constructor.map(([dependency]) => mocks.get(dependency));

          return {
            unit: new targetClass(...values) as TClass,
            unitRef: new UnitReference(mocks),
          };
        },
      };
    };
  }
}

function isPrimitive(value: unknown): value is PrimitiveValue {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'symbol' ||
    value === null
  );
}
