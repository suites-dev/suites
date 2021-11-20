import { DeepPartial } from 'ts-essentials';
import { Reflector } from '@nestjs/core';
import { PARAMTYPES_METADATA } from '@nestjs/common/constants';
import { Type } from '@nestjs/common/interfaces';
import { DeepMockOf, MockOf, MockFunction, Override, UnitTestingClass } from './types';
import { MockResolver } from './mock-resolver';

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

  /**
   * Declares on the dependency to deep mock
   *
   * @see {@link https://github.com/marchaos/jest-mock-extended#deep-mocks}
   *
   * @param dependency {Type}
   * @return Override
   */
  mockDeep<T = any>(dependency: Type<T>): Override<T>;

  /**
   * Compiles the unit and creates new testing unit
   *
   * @param deep {boolean} - deep mock the rest of the dependencies
   * @default false
   * @return UnitTestingClass
   */
  compile(deep?: boolean): UnitTestingClass<TClass>;
}

export class UnitBuilder<TClass = any> {
  private readonly deps: Type[];
  private readonly overloadsMap = new Map<Type, DeepPartial<unknown>>();
  private readonly depNamesToMocks = new Map<Type, DeepMockOf<any> | MockOf<any>>();

  public constructor(
    private readonly reflector: Reflector,
    private readonly mockFn: MockFunction,
    private readonly targetClass: Type<TClass>
  ) {
    this.deps = this.reflector.get(PARAMTYPES_METADATA, this.targetClass);
  }

  public mock<T = any>(dependency: Type<T>): Override<T> {
    return {
      using: (partial: DeepPartial<T>): UnitBuilder<TClass> => {
        this.depNamesToMocks.set(dependency, this.mockFn<T>(partial));

        return this;
      },
    };
  }

  public mockDeep<T = any>(dependency: Type<T>): Override<T> {
    return {
      using: (partial: DeepPartial<T>): UnitBuilder<TClass> => {
        this.depNamesToMocks.set(dependency, this.mockFn<T>(partial, { deep: true }));

        return this;
      },
    };
  }

  public compile(deep = false): UnitTestingClass<TClass> {
    this.mockUnMockedDependencies(deep);

    const values = Array.from(this.depNamesToMocks.values());

    return {
      unit: new this.targetClass(...values) as TClass,
      unitRef: new MockResolver(this.depNamesToMocks),
    };
  }

  private mockUnMockedDependencies(deep = false) {
    this.deps.forEach((dependency: Type<any>) => {
      if (!this.overloadsMap.get(dependency)) {
        const mock = this.mockFn<typeof dependency>(undefined, { deep });
        this.depNamesToMocks.set(dependency, mock);
      }
    });
  }
}
