import { createStubInstance } from 'sinon';
import { TestingUnit, Override, SpecBuilderAbstract, SpecBuilder } from '@automock/core';
import { SinonMockOverrides, SinonMockFn, Type, DependencyKey } from '@automock/common';

export interface SinonSpecBuilder<TClass> {
  mock<T = any>(dependencyToken: string): Override<T>;
  mock<T = any>(type: Type<T>): Override<T>;
  mock<T = any>(dependencyTypeOrToken: DependencyKey<T>): Override<T>;

  compile(): TestingUnit<TClass>;
}

export class SinonSpecBuilder<TClass = any> extends SpecBuilderAbstract<TClass> {
  public constructor(targetClass: Type<TClass>, private readonly mockFn: typeof createStubInstance) {
    super(targetClass);
  }

  public mock<T = any>(token: string): Override<T>;
  public mock<T = any>(type: Type<T>): Override<T>;

  public mock<T = any>(typeOrToken: DependencyKey<T>): Override<T> {
    return {
      using: (mockImplementation: SinonMockOverrides<T>): SpecBuilder<TClass> => {
        if (typeof typeOrToken === 'string') {
          this.mockImpls.set(typeOrToken, this.mockFn<T>(new Function(), mockImplementation));
        } else {
          this.mockImpls.set(typeOrToken, this.mockFn<T>(typeOrToken, mockImplementation));
        }

        return this;
      },
    };
  }

  public compile(): TestingUnit<TClass> {
    return super.compile();
  }

  protected voidMock<T>(dependency: Type<T>): SinonMockFn<T> {
    return this.mockFn<T>(dependency);
  }
}
