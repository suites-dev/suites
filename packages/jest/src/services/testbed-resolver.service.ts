import 'reflect-metadata';
import { DeepPartial } from 'ts-essentials';
import { MockFunction, Override, UnitTestbed, Type, ClassDependencies } from '../types';
import { MockResolver } from './mock-resolver';
import { ReflectorService } from './reflector.service';

import Mocked = jest.Mocked;

export interface TestbedResolver<TClass = any> {
  /**
   * Declares on the dependency to mock
   *
   * @see jest-mock-extended in action {@link https://github.com/marchaos/jest-mock-extended#example}
   *
   * @return Override
   * @param type
   */
  mock<T = any>(type: Type<T>): Override<T>;
  mock<T = any>(token: string): Override<T>;
  mock<T = any>(typeOrToken: Type<T> | string): Override<T>;

  /**
   * Compiles the unit and creates new testing unit
   *
   * @return UnitTestbed
   */
  compile(): UnitTestbed<TClass>;
}

export class TestbedResolver<TClass = any> {
  private readonly dependencies: ClassDependencies = new Map<Type | string, Type>();
  private readonly depNamesToMocks = new Map<Type | string, Mocked<any>>();

  public constructor(
    private readonly reflector: ReflectorService,
    private readonly mockFn: MockFunction,
    private readonly targetClass: Type<TClass>
  ) {
    this.dependencies = this.reflector.reflectDependencies(targetClass);
  }

  public mock<T = any>(token: string): Override<T>;
  public mock<T = any>(type: Type<T>): Override<T>;
  public mock<T = any>(typeOrToken: Type<T> | string): Override<T> {
    return {
      using: (mockImplementation: DeepPartial<T>): TestbedResolver<TClass> => {
        this.depNamesToMocks.set(typeOrToken, this.mockFn<T>(mockImplementation));
        return this;
      },
    };
  }

  public compile(): UnitTestbed<TClass> {
    const deps = this.mockUnMockedDependencies();
    const values = Array.from(deps.values());

    return {
      unit: new this.targetClass(...values) as TClass,
      unitRef: new MockResolver(deps),
    };
  }

  private mockUnMockedDependencies(): Map<Type | string, Mocked<any>> {
    const map = new Map<Type | string, Mocked<any>>();

    for (const [key, dependency] of this.dependencies.entries()) {
      const overriddenDep = this.depNamesToMocks.get(key);
      const mock = overriddenDep ? overriddenDep : this.mockFn<typeof dependency>();

      map.set(key, mock);
    }

    return map;
  }
}
