import { MockFunction, Type } from '@automock/types';
import { AutomockReflectors, PackageResolver } from './services/package-resolver';
import { DependenciesMocker } from './services/dependencies-mocker';
import { BuilderFactory, TestBedBuilder } from './services/testbed-builder';

export function createTestbedBuilder<TClass>(
  mockFn: MockFunction<unknown>,
  reflectors: Record<string, string>
): (targetClass: Type<TClass>) => TestBedBuilder<TClass> {
  try {
    const packageResolver = new PackageResolver(reflectors, {
      resolve: require.resolve,
      require,
    });

    const reflector = packageResolver.resolveCorrespondingReflector();
    const dependenciesMapper = new DependenciesMocker(reflector, mockFn);

    return BuilderFactory.create<TClass>(mockFn, dependenciesMapper);
  } catch (error: unknown) {
    throw new Error(
      `No corresponding reflector found. Please make sure to install one of the following reflector packages: ${Object.keys(
        reflectors
      ).join(
        ', '
      )}. Refer to the documentation for further information: https://github.com/automock/automock#installation.`
    );
  }
}

export const AutomockTestBuilder = <TClass>(
  mockFn: MockFunction<unknown>
): ((targetClass: Type<TClass>) => TestBedBuilder<TClass>) =>
  createTestbedBuilder(mockFn, AutomockReflectors);
