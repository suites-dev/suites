import { SuitesError, SuitesErrorCode, Type } from '@suites/types.common';
import { DependencyInjectionAdapter } from '@suites/types.di';
import { MockFunction } from '@suites/types.doubles';
import { UnitBuilder, UnitMocker } from '@suites/core.unit';
import { PackageResolver } from './package-resolver';
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

export const SuitesDIAdapters = {
  nestjs: '@suites/di.nestjs',
  inversify: '@suites/di.inversify',
} as const;

function createTestbedBuilder<TClass>(
  diAdapters: typeof SuitesDIAdapters,
  doublesAdapters: typeof SuitesDoublesAdapters
): (targetClass: Type<TClass>) => TestBedBuilder<TClass> | never {
  let diAdapter: DependencyInjectionAdapter;
  let doublesAdapter: MockFunction<unknown>;

  try {
    const diPackageResolver = new PackageResolver<DependencyInjectionAdapter>(diAdapters, {
      resolve: require.resolve,
      require,
    });

    diAdapter = diPackageResolver.resolveCorrespondingAdapter();
  } catch (error: unknown) {
    throw new AdapterNotFoundError(`Suites requires an adapter to integrate with different dependency injection frameworks.
It seems that you haven't installed an appropriate package. To resolve this issue, please install
one of the available packages that matches your dependency injection framework.
Refer to the docs for further information: https://suites.dev/docs`);
  }

  try {
    const doublesPackageResolver = new PackageResolver<MockFunction<unknown>>(doublesAdapters, {
      resolve: require.resolve,
      require,
    });

    doublesAdapter = doublesPackageResolver.resolveCorrespondingAdapter();
  } catch (error: unknown) {
    throw new AdapterNotFoundError(`Suites requires an adapter to integrate with different mocking libraries.
It seems that you haven't installed an appropriate adapter package. To resolve this issue, please install
one of the available packages that matches your mocking library.
Refer to the docs for further information: https://suites.dev/docs`);
  }

  const unitMocker = new UnitMocker(doublesAdapter);

  return UnitBuilder.create<TClass>(doublesAdapter, unitMocker, diAdapter, console);
}

export function TestBedBuilderFactory<TClass>(targetClass: Type<TClass>) {
  return createTestbedBuilder<TClass>(SuitesDIAdapters, SuitesDoublesAdapters)(targetClass);
}
