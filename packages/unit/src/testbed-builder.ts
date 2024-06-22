import * as console from 'console';
import type { Type } from '@suites/types.common';
import { SuitesError, SuitesErrorCode } from '@suites/types.common';
import type { DependencyInjectionAdapter } from '@suites/types.di';
import type { TestBedBuilder } from '@suites/core.unit';
import { UnitMocker } from '@suites/core.unit';
import { PackageResolver } from './package-resolver';
import type { DoublesAdapter } from '@suites/types.doubles';

export class AdapterNotFoundError extends SuitesError {
  public constructor(message: string) {
    super(SuitesErrorCode.ADAPTER_NOT_FOUND, 'No compatible adapter found', message);
    this.name = 'AdapterNotFoundError';
  }
}

export const SuitesDoublesAdapters = {
  jest: '@suites/doubles.jest',
  sinon: '@suites/doubles.sinon',
  vitest: '@suites/doubles.vitest',
  bun: '@suites/doubles.bun',
  deno: '@suites/doubles.deno',
  node: '@suites/doubles.node',
} as const;

export const SuitesDIAdapters = {
  nestjs: '@suites/di.nestjs',
  inversify: '@suites/di.inversify',
  tsyringe: '@suites/di.tsyringe',
} as const;

export function testBedBuilderFactory<TClass>(
  diAdapters: typeof SuitesDIAdapters,
  doublesAdapters: typeof SuitesDoublesAdapters,
  targetClass: Type<TClass>
): { create: <TBuilder>(testbedBuilderType: Type<TestBedBuilder<TClass>>) => TBuilder } {
  return {
    create: <TBuilder>(testbedBuilderType: Type<TestBedBuilder<TClass>>): TBuilder => {
      const diPackageResolver = new PackageResolver<DependencyInjectionAdapter>(diAdapters);

      const diAdapter = diPackageResolver
        .resolveCorrespondingAdapter()
        .then((adapter) => adapter)
        .catch(() => {
          throw new AdapterNotFoundError(`It seems that there is an issue with the adapter package needed to integrate Suites
with your dependency injection framework. To resolve this issue, please install the
correct Suites adapter package that is compatible with your dependency injection framework.
For more details, refer to our docs website: https://suites.dev/docs`);
        });

      const doublesPackageResolver = new PackageResolver<DoublesAdapter>(doublesAdapters);

      const doublesAdapter = doublesPackageResolver
        .resolveCorrespondingAdapter()
        .then((adapter) => adapter)
        .catch(() => {
          throw new AdapterNotFoundError(`It seems that there is an issue with the adapter package needed to integrate Suites
with your mocking library. To resolve this issue, please install the
correct Suites adapter package that is compatible with mocking library.
For more details, refer to our docs website: https://suites.dev/docs`);
        });

      const unitMocker = new UnitMocker(
        doublesAdapter.then((adapter) => adapter.mock),
        diAdapter
      );

      return new testbedBuilderType(doublesAdapter, unitMocker, targetClass, console) as TBuilder;
    },
  };
}
