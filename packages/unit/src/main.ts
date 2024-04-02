import { SuitesError, SuitesErrorCode, Type } from '@suites/types.common';
import { DependencyInjectionAdapter } from '@suites/types.di';
import { MockFunction } from '@suites/types.doubles';
import { SolitaryTestBedBuilder, SociableTestBedBuilder, UnitMocker } from '@suites/core.unit';
import { PackageResolver } from './package-resolver';
import * as console from 'console';
import { TestBedBuilder } from './types';

export class AdapterNotFoundError extends SuitesError {
  public constructor(message: string) {
    super(SuitesErrorCode.ADAPTER_NOT_FOUND, 'No compatible adapter found', message);
    this.name = 'AdapterNotFoundError';
  }
}

const SuitesDoublesAdapters = {
  jest: '@suites/doubles.jest',
  sinon: '@suites/doubles.sinon',
  vitest: '@suites/doubles.vitest',
} as const;

const SuitesDIAdapters = {
  nestjs: '@suites/di.nestjs',
  inversify: '@suites/di.inversify',
} as const;

function testBedBuilderFactory<TClass>(
  diAdapters: typeof SuitesDIAdapters,
  doublesAdapters: typeof SuitesDoublesAdapters,
  targetClass: Type<TClass>
): { create: <TBuilder>(type: Type<TestBedBuilder<TClass>>) => TBuilder } {
  return {
    create: <TBuilder>(type: Type<TestBedBuilder<TClass>>): TBuilder => {
      const diPackageResolver = new PackageResolver<DependencyInjectionAdapter>(diAdapters);

      const diAdapter = diPackageResolver
        .resolveCorrespondingAdapter()
        .then((adapter) => adapter)
        .catch(() => {
          throw new AdapterNotFoundError(`Suites requires an adapter to integrate with different dependency injection frameworks.
It seems that you haven't installed an appropriate package. To resolve this issue, please install
one of the available packages that matches your dependency injection framework.
Refer to the docs for further information: https://suites.dev/docs`);
        });

      const doublesPackageResolver = new PackageResolver<MockFunction<unknown>>(doublesAdapters);

      const doublesAdapter = doublesPackageResolver
        .resolveCorrespondingAdapter()
        .then((adapter) => adapter)
        .catch(() => {
          throw new AdapterNotFoundError(`Suites requires an adapter to integrate with different mocking libraries.
It seems that you haven't installed an appropriate adapter package. To resolve this issue, please install
one of the available packages that matches your mocking library.
Refer to the docs for further information: https://suites.dev/docs`);
        });

      const unitMocker = new UnitMocker(doublesAdapter, diAdapter);

      return new type(doublesAdapter, diAdapter, unitMocker, targetClass, console) as TBuilder;
    },
  };
}

export class TestBed {
  public static solitary<TClass = any>(targetClass: Type<TClass>): SolitaryTestBedBuilder<TClass> {
    return testBedBuilderFactory(SuitesDIAdapters, SuitesDoublesAdapters, targetClass).create(
      SolitaryTestBedBuilder
    );
  }

  public static sociable<TClass = any>(targetClass: Type<TClass>): SociableTestBedBuilder<TClass> {
    return testBedBuilderFactory(SuitesDIAdapters, SuitesDoublesAdapters, targetClass).create(
      SolitaryTestBedBuilder
    );
  }

  public static create<TClass = any>(targetClass: Type<TClass>): SolitaryTestBedBuilder<TClass> {
    return TestBed.solitary<TClass>(targetClass);
  }
}
