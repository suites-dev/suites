import 'reflect-metadata';
import { FnPartialReturn } from '@automock/types';
import { MockResolver } from './mock-resolver';
import { ReflectorService } from './reflector.service';
import { MockFunction, Override, UnitTestbed, Type, ClassDependencies } from '../types';
import { DeepMocked } from '@automock/doubles.jest';

export interface TestbedBuilder<TClass = any> {
  /**
   * Declares on the dependency to mock
   *
   * @param type
   * @return Override
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

export class TestbedBuilder<TClass = any> {
  private readonly dependencies: ClassDependencies = new Map<Type | string, Type>();
  private readonly depNamesToMocks = new Map<Type | string, DeepMocked<TClass>>();

  public constructor(
    private readonly reflector: ReflectorService,
    private readonly mockFn: MockFunction,
    private readonly targetClass: Type<TClass>
  ) {
    this.dependencies = this.reflector.reflectDependencies(targetClass);
  }

  public mock<T extends Record<string | number | symbol, any> = any>(token: string): Override<T>;
  public mock<T extends Record<string | number | symbol, any> = any>(type: Type<T>): Override<T>;
  public mock<T extends Record<string | number | symbol, any> = any>(
    typeOrToken: Type<T> | string
  ): Override<T> {
    return {
      using: (mockImplementation: FnPartialReturn<T>): TestbedBuilder<TClass> => {
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

  private mockUnMockedDependencies(): Map<Type | string, DeepMocked<any>> {
    const map = new Map<Type | string, DeepMocked<any>>();

    for (const [key, dependency] of this.dependencies.entries()) {
      const overriddenDep = this.depNamesToMocks.get(key);
      const mock = overriddenDep ? overriddenDep : this.mockFn<typeof dependency>();

      map.set(key, mock);
    }

    return map;
  }
}
