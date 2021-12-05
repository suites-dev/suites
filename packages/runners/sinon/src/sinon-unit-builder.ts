import { createStubInstance } from 'sinon';
import { TestingUnit, Override, UnitBuilderAbstract, UnitBuilderr } from '@automock/core';
import { SinonMockOverrides, SinonMockFn, Type, DependencyKey } from '@automock/common';

export interface UnitBuilder<TClass> {
  mock<T = any>(dependencyToken: string): Override<T, TClass>;
  mock<T = any>(type: Type<T>): Override<T, TClass>;
  mock<T = any>(dependencyTypeOrToken: DependencyKey<T>): Override<T, TClass>;

  compile(): TestingUnit<TClass>;
}

export class UnitBuilder<TClass = any> extends UnitBuilderAbstract<TClass> implements UnitBuilderr<TClass> {
  public constructor(targetClass: Type<TClass>, private readonly mockFn: typeof createStubInstance) {
    super(targetClass);
  }

  public mock<T = any>(token: string): Override<T, TClass>;
  public mock<T = any>(type: Type<T>): Override<T, TClass>;

  public mock<T = any>(typeOrToken: DependencyKey<T>): Override<T, TClass> {
    return {
      using: (mockImplementation: SinonMockOverrides<T>): UnitBuilder<TClass> => {
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
