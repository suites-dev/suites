import 'reflect-metadata';
import { createStubInstance } from 'sinon';
import { TestingUnit, Override, UnitBuilderAbstract, BaseUnitBuilder } from '@aromajs/core';
import { SinonMockOverrides, SinonMockFn, Type } from '@aromajs/common';

export interface UnitBuilder<TClass> extends BaseUnitBuilder<TClass> {
  mock<T = any>(dependency: Type<T>): Override<T>;
}

export class UnitBuilder<TClass = any> extends UnitBuilderAbstract<TClass, SinonMockFn<unknown>> {
  public constructor(
    reflector: typeof Reflect,
    targetClass: Type<TClass>,
    private readonly mockFn: typeof createStubInstance
  ) {
    super(reflector, targetClass);
  }

  public mock<T>(dependency: Type<T>): Override<T> {
    return {
      using: (mockImplementation: SinonMockOverrides<T>): UnitBuilder<TClass> => {
        this.overloadsMap.set(dependency, this.mockFn<T>(dependency, mockImplementation));
        return this;
      },
    };
  }

  public compile(): TestingUnit<TClass> {
    return super.compile();
  }

  protected mockCb<T>(dependency: Type<T>): SinonMockFn<T> {
    return this.mockFn<T>(dependency);
  }
}
