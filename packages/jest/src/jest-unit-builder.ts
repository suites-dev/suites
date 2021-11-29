import 'reflect-metadata';
import { DeepPartial } from 'ts-essentials';
import { mock } from 'jest-mock-extended';
import { TestingUnit, Override, UnitBuilderAbstract, BaseUnitBuilder } from '@aromajs/core';
import { JestMockFn, Type } from '@aromajs/common';

export interface UnitBuilder<TClass> extends BaseUnitBuilder<TClass> {
  mock<T = any>(dependency: Type<T>): Override<T>;
}

export class UnitBuilder<TClass = any> extends UnitBuilderAbstract<TClass, JestMockFn<unknown>> {
  public constructor(reflector: typeof Reflect, targetClass: Type<TClass>, private readonly mockFn: typeof mock) {
    super(reflector, targetClass);
  }

  public mock<T>(dependency: Type<T>): Override<T> {
    return {
      using: (mockImplementation: DeepPartial<T>): UnitBuilder<TClass> => {
        this.overloadsMap.set(dependency, this.mockFn<T>(mockImplementation));
        return this;
      },
    };
  }

  public compile(deep = false): TestingUnit<TClass> {
    return super.compile(deep);
  }

  protected mockCb<T>(dependency: Type<T>, deep = false): JestMockFn<T> {
    return this.mockFn<T>(undefined, { deep });
  }
}
