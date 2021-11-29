import 'reflect-metadata';
import { MockPartialImplementation, MockOf, Type } from '@aromajs/common';
import { MockResolver } from './mock-resolver';
import { Override, TestingUnit } from './types';

export interface BaseUnitBuilder<TClass = any> {
  /**
   * Declares on the dependency to mock
   *
   * @param dependency {Type}
   * @return Override
   */
  mock<T = any>(dependency: Type<T>): Override<MockPartialImplementation<T>>;

  /**
   * Compiles the unit and creates new testing unit
   *
   * @return TestingUnit
   */
  compile(deep?: boolean): TestingUnit<TClass>;
}

export abstract class UnitBuilderAbstract<TClass, M extends MockOf<any>> implements BaseUnitBuilder<TClass> {
  private readonly unitDeps: Type[];
  private readonly depNamesToMocks = new Map<Type, MockOf<any>>();

  protected readonly overloadsMap = new Map<Type, MockPartialImplementation<unknown>>();

  protected constructor(private readonly reflector: typeof Reflect, private readonly targetClass: Type<TClass>) {
    this.unitDeps = this.reflector.getMetadata('design:paramtypes', this.targetClass);
  }

  public abstract mock<T = any>(dependency: Type<T>): Override<T>;

  public compile(deep?: boolean): TestingUnit<TClass> {
    this.mockUnMockedDependencies(deep);

    const values = Array.from(this.depNamesToMocks.values());

    return {
      unit: new this.targetClass(...values) as TClass,
      unitRef: new MockResolver<M>(this.depNamesToMocks),
    };
  }

  protected abstract mockCb<TClass>(dependency: Type<TClass>, ...args: any[]): MockOf<TClass>;

  private mockUnMockedDependencies(deep = false) {
    this.unitDeps.forEach((dependency: Type<any>) => {
      const overriddenDep = this.overloadsMap.get(dependency);
      const mock = overriddenDep ? overriddenDep : this.mockCb(dependency, deep);

      this.depNamesToMocks.set(dependency, mock);
    });
  }
}
