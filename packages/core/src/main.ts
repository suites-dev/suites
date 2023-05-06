import { Type } from '@automock/types';
import { AutomockReflectors, PackageResolver } from './services/package-resolver';
import { DependenciesMocker } from './services/dependencies-mocker';
import { BuilderFactory, TestBedBuilder } from './services/testbed-builder';
import { MockFunction } from './types';

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
      `Automock cannot find any corresponding reflector, did you install one of the following: ${Object.keys(
        reflectors
      ).join(', ')}? see https://github.com/automock/automock#installation for more info.`
    );
  }
}

export const AutomockTestBuilder = <TClass>(
  mockFn: MockFunction<unknown>
): ((targetClass: Type<TClass>) => TestBedBuilder<TClass>) =>
  createTestbedBuilder(mockFn, AutomockReflectors);
