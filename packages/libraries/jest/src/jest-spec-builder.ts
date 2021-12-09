import { DeepPartial } from 'ts-essentials';
import { mock } from 'jest-mock-extended';
import { TestingUnit, Override, SpecBuilderAbstract, SpecBuilder } from '@automock/core';
import { DependencyKey, JestMockFn, Type } from '@automock/common';

export interface JestSpecBuilder<TClass> {
  mock<T = any>(token: string): Override<T>;
  mock<T = any>(token: Type<T>): Override<T>;
  mock<T = any>(token: DependencyKey<T>): Override<T>;

  compile(deep?: boolean): TestingUnit<TClass>;
}

export class JestSpecBuilder<TClass = any> extends SpecBuilderAbstract<TClass> {
  public constructor(targetClass: Type<TClass>, private readonly mockFn: typeof mock) {
    super(targetClass);
  }

  public mock<T = any>(token: string): Override<T>;
  public mock<T = any>(type: Type<T>): Override<T>;

  public mock<T = any>(typeOrToken: DependencyKey<T>): Override<T> {
    return {
      using: (mockImplementation: T): SpecBuilder<TClass> => {
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
