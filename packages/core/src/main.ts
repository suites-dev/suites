import { MockFunction, Type } from '@automock/types';
import { AutomockAdapters, PackageResolver } from './services/package-resolver';
import { UnitMocker } from './services/unit-mocker';
import { UnitBuilder, TestBedBuilder } from './services/testbed-builder';

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
    const unitMocker = new UnitMocker(adapter, mockFn);

    return UnitBuilder.create<TClass>(mockFn, unitMocker);
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
