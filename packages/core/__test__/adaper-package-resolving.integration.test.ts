import * as fs from 'fs';
import path from 'path';
import { PackageReader } from '../src/services/package-reader';
import { PackageResolver } from '../src/services/package-resolver';
import {
  AdapterResolvingFailure,
  AdapterResolvingFailureReason,
  NodeRequire,
} from '../src/services/types';
import { AutomockAdapter } from '../src';

import Mocked = jest.Mocked;

describe('Automock Adapter Package Resolving Integration Test', () => {
  let packageResolver: PackageResolver;
  let packageReader: Mocked<PackageReader>;

  describe('Resolving an adapter with default export', () => {
    let nodeRequire: NodeRequire;

    beforeAll(() => {
      nodeRequire = { resolve: require.resolve, require, main: require.main };
      packageReader = {
        resolveAutomockAdapter: jest.fn(),
        fs,
        path,
      } as never;
      packageReader.resolveAutomockAdapter.mockReturnValueOnce('test');

      packageResolver = new PackageResolver(
        { test: './assets/test-adapter' },
        nodeRequire,
        packageReader
      );
    });

    it('should successfully resolve the adapter package', () => {
      const adapter = packageResolver.resolveCorrespondingAdapter();
      expect(adapter.inspect({} as never)).toBe('success');
    });
  });

  describe('Resolving an adapter with no default export', () => {
    let adapters: Record<AutomockAdapter, string>;
    let nodeRequire: NodeRequire;

    beforeAll(() => {
      nodeRequire = {
        require: require,
        resolve: require.resolve,
        main: {
          filename: 'test',
        },
      } as never;
      adapters = {
        test: './assets/invalid-adapter',
      };
      packageResolver = new PackageResolver(
        adapters,
        nodeRequire,
        new PackageReader(adapters, nodeRequire, path, fs)
      );
    });

    it('should failed resolving the adapter package and throw an error', () => {
      expect(() => packageResolver.resolveCorrespondingAdapter()).toThrow(
        new AdapterResolvingFailure(AdapterResolvingFailureReason.NO_DEFAULT_EXPORT)
      );
    });
  });

  describe('Could not resolving an adapter', () => {
    let adapters: Record<AutomockAdapter, string>;
    let nodeRequire: NodeRequire;

    beforeAll(() => {
      nodeRequire = {
        main: {
          filename: 'test',
        },
      } as never;
      adapters = {};
      packageResolver = new PackageResolver(
        adapters,
        nodeRequire,
        new PackageReader(adapters, nodeRequire, path, fs)
      );

      packageReader.resolveAutomockAdapter.mockReturnValueOnce(undefined);
    });

    it('should failed resolving the adapter package and throw an error', () => {
      expect(() => packageResolver.resolveCorrespondingAdapter()).toThrow(
        new AdapterResolvingFailure(AdapterResolvingFailureReason.NO_COMPATIBLE_ADAPTER_FOUND)
      );
    });
  });
});
