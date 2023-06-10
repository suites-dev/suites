import { MockFunction, Type } from '@automock/types';
import { AutomockAdapters, PackageResolver } from './services/package-resolver';
import { DependenciesMocker } from './services/dependencies-mocker';
import { BuilderFactory, TestBedBuilder } from './services/testbed-builder';

export function createTestbedBuilder<TClass>(
  mockFn: MockFunction<unknown>,
  adapters: Record<string, string>
): (targetClass: Type<TClass>) => TestBedBuilder<TClass> {
  try {
    const packageResolver = new PackageResolver(adapters, {
      resolve: require.resolve,
      require,
    });

    const adapter = packageResolver.resolveCorrespondingAdapter();
    const dependenciesMapper = new DependenciesMocker(adapter, mockFn);

    return BuilderFactory.create<TClass>(mockFn, dependenciesMapper);
  } catch (error: unknown) {
    throw new Error(
      `No corresponding adapter found. Please make sure to install one of the following adapters packages: ${Object.keys(
        adapters
      ).join(
        ', '
      )}. Refer to the documentation for further information: https://github.com/automock/automock#installation.`
    );
  }
}

export const AutomockTestBuilder = <TClass>(
  mockFn: MockFunction<unknown>
): ((targetClass: Type<TClass>) => TestBedBuilder<TClass>) =>
  createTestbedBuilder(mockFn, AutomockAdapters);
