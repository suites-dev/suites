import * as console from 'console';
import type { Type } from '@suites/types.common';
import { SuitesError, SuitesErrorCode } from '@suites/types.common';
import type { DependencyInjectionAdapter } from '@suites/types.di';
import type { TestBedBuilder } from '@suites/core.unit';
import { UnitMocker } from '@suites/core.unit';
import { createPackageResolver } from './package-resolver';
import type { DoublesAdapter } from '@suites/types.doubles';

/**
 * Thrown when Suites cannot find a compatible adapter package for the DI framework or mocking library.
 *
 * This occurs when the required adapter package is not installed or cannot be resolved.
 * Install the appropriate adapter package to resolve this error.
 *
 * @since 3.0.0
 * @see https://suites.dev/docs
 */
export class AdapterNotFoundError extends SuitesError {
  public constructor(message: string) {
    super(SuitesErrorCode.ADAPTER_NOT_FOUND, 'No compatible adapter found', message);
    this.name = 'AdapterNotFoundError';
  }
}

/**
 * Registry of supported mocking library adapter packages.
 *
 * Maps mocking library names to their corresponding Suites adapter package names.
 * Suites automatically detects which library is installed and loads the appropriate adapter.
 *
 * @since 3.0.0
 */
export const SuitesDoublesAdapters = {
  jest: '@suites/doubles.jest',
  sinon: '@suites/doubles.sinon',
  vitest: '@suites/doubles.vitest',
  bun: '@suites/doubles.bun',
  deno: '@suites/doubles.deno',
  node: '@suites/doubles.node',
} as const;

/**
 * Registry of supported dependency injection framework adapter packages.
 *
 * Maps DI framework names to their corresponding Suites adapter package names.
 * Suites automatically detects which DI framework is installed and loads the appropriate adapter.
 *
 * @since 3.0.0
 */
export const SuitesDIAdapters = {
  nestjs: '@suites/di.nestjs',
  inversify: '@suites/di.inversify',
  tsyringe: '@suites/di.tsyringe',
} as const;

/**
 * Factory function for creating TestBedBuilder instances with automatic adapter resolution.
 *
 * This function resolves and configures the appropriate DI and mocking library adapters
 * based on what's installed in the project, then creates a builder for the specified target class.
 *
 * @internal This is used internally by TestBed.solitary() and TestBed.sociable()
 * @template TClass The type of the class to be tested
 * @param diAdapters Registry of DI framework adapters
 * @param doublesAdapters Registry of mocking library adapters
 * @param targetClass The class for which to create the test environment
 * @returns Factory object with a create method for building TestBedBuilder instances
 * @since 3.0.0
 */
export function testBedBuilderFactory<TClass>(
  diAdapters: typeof SuitesDIAdapters,
  doublesAdapters: typeof SuitesDoublesAdapters,
  targetClass: Type<TClass>
): { create: <TBuilder>(testbedBuilderType: Type<TestBedBuilder<TClass>>) => TBuilder } {
  return {
    create: <TBuilder>(testbedBuilderType: Type<TestBedBuilder<TClass>>): TBuilder => {
      const diPackageResolver = createPackageResolver<DependencyInjectionAdapter>(diAdapters);

      const diAdapter = diPackageResolver
        .resolveCorrespondingAdapter()
        .then((adapter) => adapter)
        .catch(() => {
          throw new AdapterNotFoundError(`It seems that there is an issue with the adapter package needed to integrate Suites
with your dependency injection framework. To resolve this issue, please install the
correct Suites adapter package that is compatible with your dependency injection framework.
For more details, refer to our docs website: https://suites.dev/docs`);
        });

      const doublesPackageResolver = createPackageResolver<DoublesAdapter>(doublesAdapters);

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
