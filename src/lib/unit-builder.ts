import 'reflect-metadata';
import { DeepPartial } from 'ts-essentials';
import { MockOf, MockFunction, Override, TestingUnit, Type } from './types';
import { MockResolver } from './mock-resolver';
import { ReflectorService } from './reflector.service';

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
  mock<T = any>(dependency: string): Override<T>;
  mock<T = any>(dependency: Type<T> | string): Override<T>;

  /**
   * Compiles the unit and creates new testing unit
   *
   * @return TestingUnit
   */
  compile(): TestingUnit<TClass>;
}

export class UnitBuilder<TClass = any> {
  private readonly dependencies = new Map<Type | string, DeepPartial<unknown>>();
  private readonly depNamesToMocks = new Map<Type | string, MockOf<any>>();

  public constructor(
    private readonly reflector: ReflectorService,
    private readonly mockFn: MockFunction,
    private readonly targetClass: Type<TClass>
  ) {
    this.dependencies = this.reflector.reflectDependencies(targetClass);
  }

  public mock<T = any>(dependency: string): Override<T>;
  public mock<T = any>(dependency: Type<T>): Override<T>;
  public mock<T = any>(dependency: Type<T> | string): Override<T> {
    return {
      using: (mockImplementation: DeepPartial<T>): UnitBuilder<TClass> => {
        this.depNamesToMocks.set(dependency, this.mockFn<T>(mockImplementation));
        return this;
      },
    };
  }

  public compile(): TestingUnit<TClass> {
    const deps = this.mockUnMockedDependencies();
    const values = Array.from(deps.values());

    return {
      unit: new this.targetClass(...values) as TClass,
      unitRef: new MockResolver(deps),
    };
  }

  private mockUnMockedDependencies(): Map<Type | string, MockOf<any>> {
    const map = new Map<Type | string, MockOf<any>>();

    for (const [key, dependency] of this.dependencies.entries()) {
      const overriddenDep = this.depNamesToMocks.get(key);
      const mock = overriddenDep ? overriddenDep : this.mockFn<typeof dependency>();

      map.set(key, mock);
    }

    return map;
  }
}
