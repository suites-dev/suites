import 'reflect-metadata';
import { DeepPartial } from 'ts-essentials';
import { DeepMockOf, MockOf, MockFunction, Override, TestingUnit, Type } from './types';
import { MockResolver } from './mock-resolver';

export interface UnitBuilder<TClass = any> {
  /**
   * Declares on the dependency to mock
   *
   * @see jest-mock-extended in action {@link https://github.com/marchaos/jest-mock-extended#example}
   *
   * @param dependency {Type}
   * @return Override
   */
  mock<T = any>(dependency: Type<T>): Override<T>;

  /**
   * Declares on the dependency to deep mock
   *
   * @see {@link https://github.com/marchaos/jest-mock-extended#deep-mocks}
   *
   * @param dependency {Type}
   * @return Override
   */
  mockDeep<T = any>(dependency: Type<T>): Override<T>;

  /**
   * Compiles the unit and creates new testing unit
   *
   * @param deep {boolean} - deep mock the rest of the dependencies
   * @default false
   * @return TestingUnit
   */
  compile(deep?: boolean): TestingUnit<TClass>;
}

export class UnitBuilder<TClass = any> {
  private readonly unitDeps: Type[];
  private readonly overloadsMap = new Map<Type, DeepPartial<unknown>>();
  private readonly depNamesToMocks = new Map<Type, DeepMockOf<any> | MockOf<any>>();

  public constructor(
    private readonly reflector: typeof Reflect,
    private readonly mockFn: MockFunction,
    private readonly targetClass: Type<TClass>
  ) {
    this.unitDeps = this.reflector.getMetadata('design:paramtypes', this.targetClass);
  }

  public mock<T = any>(dependency: Type<T>): Override<T> {
    return {
      using: (mockImplementation: DeepPartial<T>): UnitBuilder<TClass> => {
        this.overloadsMap.set(dependency, this.mockFn<T>(mockImplementation));
        return this;
      },
    };
  }

  public mockDeep<T = any>(dependency: Type<T>): Override<T> {
    return {
      using: (mockImplementation: DeepPartial<T>): UnitBuilder<TClass> => {
        this.overloadsMap.set(dependency, this.mockFn<T>(mockImplementation, { deep: true }));
        return this;
      },
    };
  }

  public compile(deep = false): TestingUnit<TClass> {
    this.mockUnMockedDependencies(deep);

    const values = Array.from(this.depNamesToMocks.values());

    return {
      unit: new this.targetClass(...values) as TClass,
      unitRef: new MockResolver(this.depNamesToMocks),
    };
  }

  private mockUnMockedDependencies(deep = false) {
    this.unitDeps.forEach((dependency: Type<any>) => {
      const overriddenDep = this.overloadsMap.get(dependency);
      const mock = overriddenDep
        ? overriddenDep
        : this.mockFn<typeof dependency>(undefined, { deep });

      this.depNamesToMocks.set(dependency, mock);
    });
  }
}
