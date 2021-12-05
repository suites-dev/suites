import { DeepPartial } from 'ts-essentials';
import { mock } from 'jest-mock-extended';
import { TestingUnit, Override, UnitBuilderAbstract } from '@automock/core';
import { DependencyKey, JestMockFn, Type } from '@automock/common';

export interface UnitBuilder<TClass> {
  mock<T = any>(dependencyToken: string): Override<T, TClass>;
  mock<T = any>(type: Type<T>): Override<T, TClass>;
  mock<T = any>(dependencyTypeOrToken: DependencyKey<T>): Override<T, TClass>;

  compile(deep?: boolean): TestingUnit<TClass>;
}

export class UnitBuilder<TClass = any> extends UnitBuilderAbstract<TClass> {
  public constructor(targetClass: Type<TClass>, private readonly mockFn: typeof mock) {
    super(targetClass);
  }

  public mock<T = any>(token: string): Override<T, TClass>;
  public mock<T = any>(type: Type<T>): Override<T, TClass>;

  public mock<T = any>(typeOrToken: DependencyKey<T>): Override<T, TClass> {
    return {
      using: (mockImplementation: T): UnitBuilder<TClass> => {
        this.mockImpls.set(typeOrToken, this.mockFn<T>(mockImplementation as DeepPartial<T>));
        return this;
      },
    };
  }

  public compile(deep = false): TestingUnit<TClass> {
    return super.compile(deep);
  }

  protected voidMock<T>(dependency: Type<T>, deep = false): JestMockFn<T> {
    return this.mockFn<T>(undefined, { deep });
  }
}
