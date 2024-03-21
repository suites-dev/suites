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

const SuitesDoublesAdapters: Record<string, string> = {
  jest: '@suites/doubles.jest',
  sinon: '@suites/doubles.sinon',
  vitest: '@suites/doubles.vitest',
} as const;

export const SuitesDIAdapters: Record<string, string> = {
  nestjs: '@suites/di.nestjs',
  inversify: '@suites/di.inversify',
} as const;

function createTestbedBuilder<TClass>(
  diAdapters: Record<string, string>,
  doublesAdapters: Record<string, string>
): (targetClass: Type<TClass>) => TestBedBuilder<TClass> | never {
  try {
    const diPackageResolver = new PackageResolver<DependencyInjectionAdapter>(diAdapters, {
      resolve: require.resolve,
      require,
    });

    const doublesPackageResolver = new PackageResolver<MockFunction<unknown>>(doublesAdapters, {
      resolve: require.resolve,
      require,
    });

    const diAdapter = diPackageResolver.resolveCorrespondingAdapter();
    const doublesAdapter = doublesPackageResolver.resolveCorrespondingAdapter();
    const unitMocker = new UnitMocker(doublesAdapter);

    return UnitBuilder.create<TClass>(doublesAdapter, unitMocker, diAdapter, console);
  } catch (error: unknown) {
    throw new AdapterNotFoundError(`Suites requires a DI adapter to seamlessly integrate with different dependency injection frameworks.
It seems that you haven't installed an appropriate adapter package. To resolve this issue, please install
one of the available adapters that matches your dependency injection framework.
Refer to the docs for further information: https://suites.dev/docs`);
  }
}

export function TestBedBuilderFactory<TClass>(targetClass: Type<TClass>) {
  return createTestbedBuilder<TClass>(SuitesDoublesAdapters, SuitesDIAdapters)(targetClass);
}
