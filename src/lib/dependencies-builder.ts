import { DeepPartial } from 'ts-essentials';
import { mockDeep } from 'jest-mock-extended';
import { Reflector } from '@nestjs/core';
import { PARAMTYPES_METADATA } from '@nestjs/common/constants';
import { Type } from '@nestjs/common/interfaces';
import { DeepMock, Override, UnitTestingClass } from './types';
import { MockResolver } from './mock-resolver';

export interface DependenciesBuilder<TClass = any> {
  mock<T = any>(dependency: Type<T>): Override<T>;
  compile(): UnitTestingClass<TClass>;
}

export class DependenciesBuilder<TClass = any> {
  private readonly deps: Type[];
  private readonly overloadsMap = new Map<Type, DeepPartial<unknown>>();
  private readonly depNamesToMocks = new Map<Type, DeepMock<unknown>>();

  public constructor(
    private readonly reflector: Reflector,
    private readonly createMockFn: typeof mockDeep,
    private readonly targetClass: Type<TClass>,
  ) {
    this.deps = this.reflector.get(PARAMTYPES_METADATA, this.targetClass);
  }

  public mock<T = any>(dependency: Type<T>): Override<T> {
    return {
      using: (partial: DeepPartial<T>): DependenciesBuilder => {
        this.overloadsMap.set(dependency, partial);
        return this;
      },
    };
  }

  public compile(): UnitTestingClass<TClass> {
    this.mockOrOverride(this.deps);

    const values = Array.from(this.depNamesToMocks.values());

    return { unit: new this.targetClass(...values), unitRef: new MockResolver(this.depNamesToMocks) };
  }

  private mockOrOverride(deps: Type[]) {
    deps.forEach((dependency) => {
      const itemInMap = this.overloadsMap.get(dependency);
      const mock = itemInMap ? this.createMockFn<typeof dependency>(itemInMap as DeepPartial<typeof dependency>) : this.createMockFn<typeof dependency>();

      this.depNamesToMocks.set(dependency, mock);
    });
  }
}

