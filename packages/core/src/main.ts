import path from 'path';
import * as fs from 'fs';
import { MockFunction, Type } from '@automock/types';
import { TestBedBuilder } from './public-types';
import { PackageResolver } from './services/package-resolver';
import { UnitMocker } from './services/unit-mocker';
import { UnitBuilder } from './services/testbed-builder';
import { PackageReader } from './services/package-reader';
import { AdapterResolutionFailure, AutomockAdapters, NodeRequire } from './services/types';
import { handleAdapterError } from './adapter-error-handler.static';

function createTestbedBuilder<TClass>(
  mockFn: MockFunction<unknown>,
  adapters: Record<string, string>
): (targetClass: Type<TClass>) => TestBedBuilder<TClass> | never {
  try {
    const nodeRequire: NodeRequire = {
      resolve: require.resolve,
      require,
      main: require.main,
    };

    const packageReader = new PackageReader(adapters, nodeRequire, path, fs);
    const packageResolver = new PackageResolver(adapters, nodeRequire, packageReader);

    const adapter = packageResolver.resolveCorrespondingAdapter();
    const unitMocker = new UnitMocker(mockFn);

    return UnitBuilder.create<TClass>(mockFn, unitMocker, adapter, console);
  } catch (error: unknown) {
    if (error instanceof AdapterResolutionFailure) {
      handleAdapterError(error);
    }

    throw error;
  }
}

export const AutomockTestBuilder = <TClass>(
  mockFn: MockFunction<unknown>
): ((targetClass: Type<TClass>) => TestBedBuilder<TClass> | never) =>
  createTestbedBuilder(mockFn, AutomockAdapters);
